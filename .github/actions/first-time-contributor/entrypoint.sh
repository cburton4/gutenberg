#!/bin/bash
set -e

# 1. Get the URL for the pull request.
echo "Getting the URL"
url=$(jq -r '.pull_request.html_url' $GITHUB_EVENT_PATH)
pr_number=$(jq -r '.number' $GITHUB_EVENT_PATH)

# 2. Curl the URL to get the page html.
echo "Fetching the HTML"
html=$(curl --silent $url)

# 3. Run a regular expression against the html to check for the First Time Contributor element.
echo "Testing the html"
regex='\<span class="timeline-comment-label.*\>\s*First-time contributor\s*\<\/span\>'
if ! [[ $html =~ $regex ]]; then
	echo "Pull request was not created by a first-time contributor."
	exit 78
fi

# 4. Assign the 'First Time Contributor' label.
echo "Assign the label"
curl \
	--silent \
	-X POST \
	-H "Authorization: token $GITHUB_TOKEN" \
	-H "Content-Type: application/json" \
	-d '{"labels":["First-time Contributor"]}' \
	"https://api.github.com/repos/$GITHUB_REPOSITORY/issues/$pr_number/labels" > /dev/null
