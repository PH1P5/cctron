module.exports = {
    branches: ['main'],
    plugins: [
        '@semantic-release/commit-analyzer',
        '@semantic-release/release-notes-generator',
        ["@semantic-release/exec",
            {
                "verifyReleaseCmd": 'echo "releaseType=${nextRelease.type}" >> $GITHUB_OUTPUT'
            }
        ],
        ["@semantic-release/npm", { "npmPublish": false }],
        ["@semantic-release/git", {
            "message": "chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}"
        }],
        ["@semantic-release/github",
            {
                "assets": [
                    { "path": "artifacts/*.dmg", "label": "cctron for macos" },
                    { "path": "artifacts/*.deb", "label": "cctron for linux" }
                ]
            }
        ]
    ]
};