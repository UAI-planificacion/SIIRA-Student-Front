import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	images : {
		remotePatterns : [
			{
				protocol : 'https',
				hostname : 'mailing20s.s3.amazonaws.com',
				pathname : '/**',
			},
			{
				protocol : 'https',
				hostname : 'i.ibb.co',
				pathname : '/**',
			}
		]
	}
};

export default nextConfig;

