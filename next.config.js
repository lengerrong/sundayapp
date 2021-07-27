const CopyPlugin = require('copy-webpack-plugin')

module.exports = {
    reactStrictMode: true,
    webpack: function (config, { dev, isServer }) {
        if (isServer) {
            config.plugins.push(
                new CopyPlugin({
                    patterns: [
                        { from: 'pages/api/scriptures/cnvs/nt', to: 'cnvs/nt' },
                        { from: 'pages/api/scriptures/cnvs/ot', to: 'cnvs/ot' },
                        { from: 'templates', to: 'templates' }
                    ],
                })
            )
        }
        return config
    }
}
