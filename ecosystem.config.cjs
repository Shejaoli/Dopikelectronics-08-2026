module.exports = {
apps: [
{
name: "dopik-electronics",
script: "dist/index.cjs",
cwd: "/home/deploy/apps/dopik-electronics/dopik-electronics (1)",
node_args: "",
env: {
NODE_ENV: "production",
DATABASE_URL: "postgresql://dopik-user:Dopik-Electronics-12@localhost:5432/dopik-db",
SESSION_SECRET: "886631b13d6577e2e9a54807c707b714ba96bbdc3722591e4a25f76deea1974298657e53f805b8bbe258801405419e73b695b480ece6932c90b9927daeeeea53"
}
}
]
};

