export default function GTMPageView(url) {
  const pageEvent = {
    event: 'pageview',
    page: url,
  };
  if (window && window.dataLayer) {
    window.dataLayer.push(pageEvent);
  }
  return pageEvent;
}
