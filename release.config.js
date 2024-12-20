module.exports = {
    branches: ['main'],
    plugins: [
        '@semantic-release/commit-analyzer',
        '@semantic-release/release-notes-generator',
        ["@semantic-release/git", {
            "message": `chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.releaseNotes}`
        }],
        '@semantic-release/github'
    ]
};