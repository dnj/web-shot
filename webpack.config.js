const path = require("path");
const precss = require("precss");
const autoprefixer = require("autoprefixer");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
	mode: 'development',
	entry: [
		'./src/HttpServer/frontend/ts/Main.ts',
		'./src/HttpServer/frontend/scss/main.scss',
	],
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: 'ts-loader',
				exclude: /node_modules/
			},
			{
				test: /\.(scss)$/,
				use: [
					MiniCssExtractPlugin.loader,
					'css-loader',
					{
						loader: 'postcss-loader',
						options: {
							plugins: function () { 
								return [precss,autoprefixer];
							}
						}
					}, 
					'sass-loader',
				]
			},
			{ test: /\.png$/,loader: "file-loader" },
			{ test: /\.jpg$/,loader: "file-loader" },
			{ test: /\.gif$/,loader: "file-loader" },
			{ test: /\.woff2?$/,loader: "file-loader" },
			{ test: /\.eot$/,loader: "file-loader" },
			{ test: /\.otf$/,loader: "file-loader" },
			{ test: /\.ttf$/,loader: "file-loader" },
			{ test: /\.otf$/,loader: "file-loader" },
			{ test: /\.svg$/,loader: "file-loader" },
		]
	},
	resolve: {
		extensions: [ '.tsx', '.ts', '.js', '.scss', '.css' ]
	},
	plugins: [
		new MiniCssExtractPlugin({
			filename: 'main.css',
		}),
		new CopyWebpackPlugin([
			{from: path.resolve(__dirname, './src/HttpServer/HTML/**'), to: path.resolve(__dirname, 'dist/HttpServer/HTML'), toType: 'dir', context: path.resolve(__dirname, './src/HttpServer/HTML/')},
			{from: path.resolve(__dirname, './src/HttpServer/public/assets/**'), to: path.resolve(__dirname, 'dist/HttpServer/public/assets'), toType: 'dir', context: path.resolve(__dirname, './src/HttpServer/public/assets/')}
		])
	],
	output: {
		filename: 'main.js',
		path: path.resolve(__dirname, 'dist/HttpServer/public/assets')
	}
};
