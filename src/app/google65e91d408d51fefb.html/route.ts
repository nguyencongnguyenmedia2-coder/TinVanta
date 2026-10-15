export function GET() {
  return new Response('google-site-verification: google65e91d408d51fefb.html', {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
