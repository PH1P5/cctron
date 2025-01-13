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
                    { "path": "artifacts/*_x64.dmg", "label": "cctron for macos (x64)" },
                    { "path": "artifacts/*_arm64.dmg", "label": "cctron for macos (arm64)" },
                    { "path": "artifacts/*.deb", "label": "cctron for linux" }
                ]
            }
        ]
    ]
};