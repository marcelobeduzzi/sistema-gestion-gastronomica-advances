/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self' https://jlgdziwhdkugplwrjvmv.supabase.co; connect-src 'self' https://jlgdziwhdkugplwrjvmv.supabase.co wss://jlgdziwhdkugplwrjvmv.supabase.co https://*.supabase.co; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; frame-src 'self' https://jlgdziwhdkugplwrjvmv.supabase.co; worker-src 'self' blob:; child-src 'self' blob:;"
          }
        ],
      },
    ]
  },
}

module.exports = nextConfig 