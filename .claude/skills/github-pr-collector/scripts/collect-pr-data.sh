#!/bin/bash
set -euo pipefail

# Script de collecte des données GitHub PR avec gestion CodeRabbit
# Auteur: scd-cc
# Version: 1.0.0

# Configuration et variables globales
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly PROJECT_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
readonly SCD_DIR="${PROJECT_ROOT}/.scd"
readonly COLLECTOR_DIR="${SCD_DIR}/github-pr-collector"
readonly PR_DATA_DIR="${COLLECTOR_DIR}/data/pr-data"
readonly CONFIG_DIR="${COLLECTOR_DIR}/config"
readonly CACHE_DIR="${COLLECTOR_DIR}/cache"
readonly LOG_FILE="${COLLECTOR_DIR}/collect-pr.log"

# Couleurs pour l'affichage
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly NC='\033[0m' # No Color

# Fonction de logging
log() {
    local level="$1"
    shift
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] [$level] $*" | tee -a "$LOG_FILE" >&2
}

# Fonction de nettoyage
cleanup() {
    local exit_code=$?
    if [[ -d "$CACHE_DIR" ]]; then
        find "$CACHE_DIR" -mindepth 1 -delete 2>/dev/null || true
    fi
    exit "$exit_code"
}

# Configuration du trap pour le nettoyage
trap cleanup EXIT INT TERM

# Vérification des prérequis
check_prerequisites() {
    log "INFO" "Vérification des prérequis..."
    
    if ! command -v gh >/dev/null 2>&1; then
        log "ERROR" "GitHub CLI (gh) n'est pas installé"
        return 1
    fi
    
    if ! command -v jq >/dev/null 2>&1; then
        log "ERROR" "jq n'est pas installé"
        return 1
    fi
    
    # Vérification de l'authentification GitHub
    if ! gh auth status >/dev/null 2>&1; then
        log "ERROR" "Non authentifié avec GitHub CLI. Exécutez: gh auth login"
        return 1
    fi
    
    log "INFO" "Prérequis validés ✓"
    return 0
}

# Création de la structure de dossiers
setup_directories() {
    log "INFO" "Configuration des répertoires..."
    
    mkdir -p "$PR_DATA_DIR" "$CACHE_DIR" "$CONFIG_DIR"
    
    # Permissions sécurisées
    chmod 750 "$SCD_DIR" "$COLLECTOR_DIR" "$PR_DATA_DIR" "$CACHE_DIR" "$CONFIG_DIR"
    
    log "INFO" "Structure créée: $PR_DATA_DIR"
}

# Récupération des informations du repository
get_repo_info() {
    log "INFO" "Récupération des informations du repository..."
    
    local repo_info
    if ! repo_info=$(gh repo view --json nameWithOwner,defaultBranchRef 2>/dev/null); then
        log "ERROR" "Impossible de récupérer les informations du repository"
        return 1
    fi
    
    echo "$repo_info" | jq -r '.nameWithOwner'
}

# Extraction et organisation des commentaires par sévérité (inspiré de exemple.sh)
extract_comments_to_markdown() {
    local pr_number="$1"
    local json_file="$2"
    
    log "INFO" "Extraction des commentaires de la PR #$pr_number..."
    
    # Vérifier que le fichier JSON existe
    if [[ ! -f "$json_file" ]]; then
        log "ERROR" "Fichier JSON non trouvé: $json_file"
        return 1
    fi
    
    # Créer la structure de sortie pour cette PR
    local output_dir="${PR_DATA_DIR}/pr-${pr_number}"
    mkdir -p "$output_dir"
    
    local checklist_file="${output_dir}/COMMENTS_CHECKLIST.md"
    local tmp_checklist
    tmp_checklist=$(mktemp)
    
    # Mapping priorité pour le tri (comme dans exemple.sh)
    declare -A PRIORITY=(
        ["🔴 Critical"]=1
        ["🟠 Major"]=2
        ["🟡 Minor"]=3
        ["🔵 Trivial"]=4
        ["Unclassified"]=5
    )
    
    # Initialiser le fichier checklist
    {
        echo "# PR #${pr_number} - Suivi des Commentaires"
        echo ""
    } > "$checklist_file"
    
    # Compteurs
    local count_total=0
    local count_ok=0
    local count_err=0
    
    # Boucle principale d'extraction (logique de exemple.sh)
    while read -r entry; do
        count_total=$((count_total+1))
        
        # Helper pour décoder les entrées base64
        _jq() { echo "$entry" | base64 --decode | jq -r "$1"; }
        
        local id
        local body_raw
        local user
        local url
        
        id=$(_jq '.id')
        body_raw=$(_jq '.body')
        user=$(_jq '.user')
        url=$(_jq '.url')
        
        # Skip si pas d'ID valide
        if [[ -z "$id" || "$id" == "null" ]]; then
            log "WARN" "Commentaire sans ID ignoré"
            count_err=$((count_err+1))
            continue
        fi
        
        # Normaliser les retours à la ligne
        local body
        body=$(printf '%s' "$body_raw" | tr -d '\r')
        
        # Extraire la sévérité (emoji)
        local severity
        severity=$(printf '%s' "$body" | \
            grep -m1 -oE "🔴 Critical|🟠 Major|🟡 Minor|🔵 Trivial" || true)
        [[ -z "$severity" || "$severity" == "null" ]] && severity="Unclassified"
        
        # Extraire la catégorie (texte entre underscores)
        local first_line
        first_line=$(printf '%s\n' "$body" | sed -n '1p' || true)
        local category
        category=$(printf '%s\n' "$first_line" | \
            sed -n 's/^\(\_[^|]*\_\).*/\1/p' || true)
        [[ -z "$category" ]] && category="(none)"
        
        # Extraire le titre (première ligne avec **titre**)
        local title
        title=$(
            printf '%s\n' "$body" \
            | awk '
                BEGIN { found=0 }
                /^[[:space:]]*\*\*.*\*\*[[:space:]]*$/ && found==0 {
                    line=$0
                    gsub(/^[[:space:]]*\*\*/, "", line)
                    gsub(/\*\*[[:space:]]*$/, "", line)
                    print line
                    found=1
                }
            ' || true
        )
        [[ -z "$title" ]] && title="(no title)"
        
        # Extraire la description (tout après le titre)
        local description
        description=$(
            printf '%s\n' "$body" \
            | awk -v t="$title" '
                BEGIN { state=0 }
                {
                    if (state==0) {
                        pattern = "^[[:space:]]*\\*\\*" t "\\*\\*[[:space:]]*$"
                        if ($0 ~ pattern) { state=1; next }
                        next
                    } else if (state==1) {
                        if ($0 ~ /^[[:space:]]*$/) { state=2; next }
                        else { state=2; print; next }
                    } else if (state==2) {
                        print
                    }
                }
            ' || true
        )
        
        # Créer le sous-dossier de sévérité
        mkdir -p "${output_dir}/${severity}"
        
        # Générer un nom de fichier sécurisé
        local safe_title
        safe_title=$(printf '%s' "$title" | \
            tr -cd '[:alnum:]-_ ' | \
            sed 's/[ ]\+/_/g' | \
            cut -c1-80)
        [[ -z "$safe_title" ]] && safe_title="note"
        
        local filename="${output_dir}/${severity}/${safe_title}_${id}.md"
        local relpath="${severity}/${safe_title}_${id}.md"
        
        # Générer le fichier Markdown
        cat > "$filename" <<EOF
# ${severity} ${category} ${title}

- **Author**: ${user}
- **URL**: ${url}
- **PR**: #${pr_number}

## Description

${description:-$body}
EOF
        
        # Vérifier la création
        if [[ -f "$filename" ]]; then
            count_ok=$((count_ok+1))
        else
            log "ERROR" "Échec de génération du fichier pour commentaire ID $id"
            count_err=$((count_err+1))
        fi
        
        # Ajouter à la checklist temporaire (avec priorité pour le tri)
        local prio=${PRIORITY[$severity]:-99}
        echo -e "${prio}\t- [ ] ${severity} ${category} **${title}** (${user}) → [file](${relpath})" >> "$tmp_checklist"
        
    done < <(jq -r '
        [
            .issue_comments[]?,
            .review_comments[]?
        ]
        | .[]
        | {
            id: .id,
            url: .html_url,
            user: .user.login,
            body: .body
        }
        | @base64
    ' "$json_file")
    
    # Générer la checklist finale triée par priorité
    {
        echo "# PR #${pr_number} - Suivi des Commentaires"
        echo ""
        if [[ -s "$tmp_checklist" ]]; then
            sort -n -k1,1 "$tmp_checklist" | cut -f2-
        else
            echo "_Aucun commentaire trouvé._"
        fi
    } > "$checklist_file"
    
    # Nettoyer le fichier temporaire
    rm -f "$tmp_checklist"
    
    # Générer un résumé pour cette PR
    generate_pr_summary "$pr_number" "$count_total" "$count_ok" "$count_err"
    
    log "INFO" "Commentaires traités: $count_total | Succès: $count_ok | Erreurs: $count_err"
    return 0
}

# Génération du résumé pour une PR
generate_pr_summary() {
    local pr_number="$1"
    local total="$2"
    local success="$3"
    local errors="$4"
    
    local output_dir="${PR_DATA_DIR}/pr-${pr_number}"
    local summary_file="${output_dir}/summary.md"
    
    # Récupérer les infos de base de la PR depuis le cache
    local pr_data_file="${CACHE_DIR}/pr-${pr_number}-data.json"
    local pr_title="PR #${pr_number}"
    local pr_url=""
    
    if [[ -f "$pr_data_file" ]]; then
        pr_title=$(jq -r '.title // "PR #'"$pr_number"'"' "$pr_data_file")
        pr_url=$(jq -r '.url // ""' "$pr_data_file")
    fi
    
    # Compter les commentaires par sévérité
    local critical=0
    local major=0
    local minor=0
    local trivial=0
    local unclassified=0
    
    [[ -d "${output_dir}/🔴 Critical" ]] && critical=$(find "${output_dir}/🔴 Critical" -type f -name "*.md" 2>/dev/null | wc -l)
    [[ -d "${output_dir}/🟠 Major" ]] && major=$(find "${output_dir}/🟠 Major" -type f -name "*.md" 2>/dev/null | wc -l)
    [[ -d "${output_dir}/🟡 Minor" ]] && minor=$(find "${output_dir}/🟡 Minor" -type f -name "*.md" 2>/dev/null | wc -l)
    [[ -d "${output_dir}/🔵 Trivial" ]] && trivial=$(find "${output_dir}/🔵 Trivial" -type f -name "*.md" 2>/dev/null | wc -l)
    [[ -d "${output_dir}/Unclassified" ]] && unclassified=$(find "${output_dir}/Unclassified" -type f -name "*.md" 2>/dev/null | wc -l)
    
    cat > "$summary_file" <<EOF
# PR #${pr_number}: ${pr_title}

**URL**: ${pr_url}
**Analysé le**: $(date '+%Y-%m-%d %H:%M:%S')

## Résumé des Commentaires

- 🔴 **Critical**: ${critical}
- 🟠 **Major**: ${major}
- 🟡 **Minor**: ${minor}
- 🔵 **Trivial**: ${trivial}
- ⚪ **Unclassified**: ${unclassified}

**Total**: ${success}/${total} commentaires traités

## Fichiers Générés

- [Checklist de suivi](./COMMENTS_CHECKLIST.md)
EOF
    
    # Ajouter les liens vers les dossiers de sévérité
    if [[ $critical -gt 0 ]]; then
        echo "- [🔴 Critical (${critical})](./🔴%20Critical/)" >> "$summary_file"
    fi
    if [[ $major -gt 0 ]]; then
        echo "- [🟠 Major (${major})](./🟠%20Major/)" >> "$summary_file"
    fi
    if [[ $minor -gt 0 ]]; then
        echo "- [🟡 Minor (${minor})](./🟡%20Minor/)" >> "$summary_file"
    fi
    if [[ $trivial -gt 0 ]]; then
        echo "- [🔵 Trivial (${trivial})](./🔵%20Trivial/)" >> "$summary_file"
    fi
    if [[ $unclassified -gt 0 ]]; then
        echo "- [⚪ Unclassified (${unclassified})](./Unclassified/)" >> "$summary_file"
    fi
    
    log "INFO" "Résumé généré: $summary_file"
}

# Collecte des Pull Requests
collect_pull_requests() {
    local repo_name="$1"
    local pr_state="${2:-open}"
    
    log "INFO" "Collecte des PR ($pr_state) pour $repo_name..."
    
    local pr_list_file="${CACHE_DIR}/pr-list.json"
    
    # Récupération de la liste des PR avec toutes les métadonnées nécessaires
    if ! gh pr list \
        --repo "$repo_name" \
        --state "$pr_state" \
        --json number,title,author,createdAt,updatedAt,url,headRefName,baseRefName,isDraft,mergeable \
        --limit 50 > "$pr_list_file"; then
        log "ERROR" "Échec de la récupération des PR"
        return 1
    fi
    
    local pr_count
    pr_count=$(jq 'length' "$pr_list_file")
    
    if [[ "$pr_count" -eq 0 ]]; then
        log "WARN" "Aucune PR trouvée dans l'état: $pr_state"
        return 0
    fi
    
    log "INFO" "Trouvé $pr_count PR(s) à analyser"
    
    # Traitement de chaque PR
    local pr_number
    while IFS= read -r pr_number; do
        if [[ -n "$pr_number" ]] && [[ "$pr_number" != "null" ]]; then
            process_pull_request "$repo_name" "$pr_number"
        fi
    done < <(jq -r '.[].number' "$pr_list_file")
    
    return 0
}

# Traitement d'une Pull Request individuelle
process_pull_request() {
    local repo_name="$1"
    local pr_number="$2"
    
    log "INFO" "Traitement de la PR #$pr_number..."
    
    local pr_data_file="${CACHE_DIR}/pr-${pr_number}-data.json"
    local pr_comments_file="${CACHE_DIR}/pr-${pr_number}-comments.json"
    
    # Récupération des données détaillées de la PR
    if ! gh pr view "$pr_number" \
        --repo "$repo_name" \
        --json number,title,body,author,createdAt,updatedAt,url,headRefName,baseRefName,isDraft,mergeable,labels,assignees,reviewRequests,milestone,projectCards \
        > "$pr_data_file"; then
        log "WARN" "Échec de la récupération des données pour PR #$pr_number"
        return 1
    fi
    
    # Récupération de TOUS les commentaires (issue + review comments) au format unifié
    # Créer un JSON avec issue_comments et review_comments comme dans exemple.sh
    local issue_comments
    local review_comments
    
    # Récupération des commentaires d'issue (commentaires généraux)
    if ! issue_comments=$(gh api "repos/$repo_name/issues/$pr_number/comments" --paginate); then
        log "WARN" "Échec de la récupération des commentaires d'issue pour PR #$pr_number"
        issue_comments="[]"
    fi
    
    # Récupération des commentaires de review (commentaires sur les lignes de code)
    if ! review_comments=$(gh api "repos/$repo_name/pulls/$pr_number/comments" --paginate); then
        log "WARN" "Échec de la récupération des commentaires de review pour PR #$pr_number"
        review_comments="[]"
    fi
    
    # Combiner dans un format unifié comme attendu par extract_comments_to_markdown
    # Utiliser des fichiers temporaires pour éviter "Argument list too long"
    local temp_issue="${CACHE_DIR}/temp_issue_comments_${pr_number}.json"
    local temp_review="${CACHE_DIR}/temp_review_comments_${pr_number}.json"

    echo "$issue_comments" > "$temp_issue"
    echo "$review_comments" > "$temp_review"

    jq -n \
        --slurpfile issue "$temp_issue" \
        --slurpfile review "$temp_review" \
        '{issue_comments: $issue[0], review_comments: $review[0]}' \
        > "$pr_comments_file"

    # Nettoyer les fichiers temporaires
    rm -f "$temp_issue" "$temp_review"
    
    # Extraction et organisation des commentaires par sévérité
    if ! extract_comments_to_markdown "$pr_number" "$pr_comments_file"; then
        log "ERROR" "Échec de l'extraction des commentaires pour PR #$pr_number"
        return 1
    fi
    
    log "INFO" "PR #$pr_number traitée avec succès ✓"
    return 0
}

# Génération du rapport global
generate_global_report() {
    log "INFO" "Génération du rapport global..."
    
    local report_file="${PR_DATA_DIR}/pr-analysis-report.md"
    local timestamp
    timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    # Récupérer le nom du repo une seule fois
    local repo_name
    repo_name=$(get_repo_info) || repo_name="(unknown)"
    
    cat > "$report_file" << EOF
# Rapport d'Analyse des Pull Requests

**Généré le :** $timestamp
**Repository :** $repo_name

## Résumé Global

EOF
    
    # Comptage des fichiers générés
    local pr_count=0
    local total_critical=0
    local total_major=0
    local total_minor=0
    local total_trivial=0
    local total_unclassified=0
    
    for dir in "$PR_DATA_DIR"/pr-*/; do
        if [[ -d "$dir" ]]; then
            pr_count=$((pr_count+1))
            
            # Compter par sévérité
            if [[ -d "${dir}/🔴 Critical" ]]; then
                total_critical=$((total_critical + $(find "${dir}/🔴 Critical" -type f -name "*.md" 2>/dev/null | wc -l || echo 0)))
            fi
            if [[ -d "${dir}/🟠 Major" ]]; then
                total_major=$((total_major + $(find "${dir}/🟠 Major" -type f -name "*.md" 2>/dev/null | wc -l || echo 0)))
            fi
            if [[ -d "${dir}/🟡 Minor" ]]; then
                total_minor=$((total_minor + $(find "${dir}/🟡 Minor" -type f -name "*.md" 2>/dev/null | wc -l || echo 0)))
            fi
            if [[ -d "${dir}/🔵 Trivial" ]]; then
                total_trivial=$((total_trivial + $(find "${dir}/🔵 Trivial" -type f -name "*.md" 2>/dev/null | wc -l || echo 0)))
            fi
            if [[ -d "${dir}/Unclassified" ]]; then
                total_unclassified=$((total_unclassified + $(find "${dir}/Unclassified" -type f -name "*.md" 2>/dev/null | wc -l || echo 0)))
            fi
        fi
    done
    
    local total_comments=$((total_critical + total_major + total_minor + total_trivial + total_unclassified))
    
    cat >> "$report_file" << EOF
- **Pull Requests analysées :** $pr_count
- **Total commentaires extraits :** $total_comments
  - 🔴 **Critical**: $total_critical
  - 🟠 **Major**: $total_major
  - 🟡 **Minor**: $total_minor
  - 🔵 **Trivial**: $total_trivial
  - ⚪ **Unclassified**: $total_unclassified
- **Données stockées dans :** \`.scd/github-pr-collector/data/pr-data/\`

EOF
    
    if [[ $pr_count -gt 0 ]]; then
        echo "## Liste des Pull Requests" >> "$report_file"
        echo "" >> "$report_file"
        
        for file in "$PR_DATA_DIR"/pr-*/summary.md; do
            if [[ -f "$file" ]]; then
                local pr_num
                pr_num=$(basename "$(dirname "$file")" | sed 's/pr-//')
                local pr_title
                pr_title=$(grep -m1 "^# PR #" "$file" | sed 's/^# PR #[0-9]*: //' || echo "(no title)")
                
                # Compter les commentaires de cette PR
                local pr_dir
                pr_dir=$(dirname "$file")
                local pr_critical=0
                local pr_major=0
                local pr_minor=0
                local pr_trivial=0
                
                if [[ -d "${pr_dir}/🔴 Critical" ]]; then
                    pr_critical=$(find "${pr_dir}/🔴 Critical" -type f -name "*.md" 2>/dev/null | wc -l || echo 0)
                fi
                if [[ -d "${pr_dir}/🟠 Major" ]]; then
                    pr_major=$(find "${pr_dir}/🟠 Major" -type f -name "*.md" 2>/dev/null | wc -l || echo 0)
                fi
                if [[ -d "${pr_dir}/🟡 Minor" ]]; then
                    pr_minor=$(find "${pr_dir}/🟡 Minor" -type f -name "*.md" 2>/dev/null | wc -l || echo 0)
                fi
                if [[ -d "${pr_dir}/🔵 Trivial" ]]; then
                    pr_trivial=$(find "${pr_dir}/🔵 Trivial" -type f -name "*.md" 2>/dev/null | wc -l || echo 0)
                fi
                
                local pr_total=$((pr_critical + pr_major + pr_minor + pr_trivial))
                
                echo "- [PR #$pr_num: $pr_title](./pr-$pr_num/summary.md) - $pr_total commentaires (🔴 $pr_critical | 🟠 $pr_major | 🟡 $pr_minor | 🔵 $pr_trivial)" >> "$report_file"
            fi
        done
    fi
    
    log "INFO" "Rapport global généré: $report_file"
    echo -e "${GREEN}✓ Rapport généré: $report_file${NC}"
}

# Fonction principale
main() {
    local pr_state="${1:-open}"
    
    echo -e "${BLUE}🚀 GitHub PR Collector - Démarrage${NC}"
    
    # Vérifications préliminaires
    if ! check_prerequisites; then
        exit 1
    fi
    
    # Configuration
    setup_directories
    
    # Récupération du nom du repository
    local repo_name
    if ! repo_name=$(get_repo_info); then
        log "ERROR" "Impossible de déterminer le repository courant"
        exit 1
    fi
    
    echo -e "${BLUE}📊 Repository: $repo_name${NC}"
    
    # Collecte des PR
    if ! collect_pull_requests "$repo_name" "$pr_state"; then
        log "ERROR" "Échec de la collecte des PR"
        exit 1
    fi
    
    # Génération du rapport global
    generate_global_report
    
    echo -e "${GREEN}✅ Collecte terminée avec succès!${NC}"
    echo -e "${YELLOW}📂 Données disponibles dans: $PR_DATA_DIR${NC}"
    echo -e "${BLUE}📋 Configuration disponible dans: $CONFIG_DIR${NC}"
    
    log "INFO" "Collecte GitHub PR terminée avec succès"
}

# Exécution si appelé directement
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
