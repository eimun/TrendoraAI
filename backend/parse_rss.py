import urllib.request
import xml.etree.ElementTree as ET

url = "https://trends.google.com/trending/rss?geo=US"
try:
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as response:
        xml_data = response.read()
    
    root = ET.fromstring(xml_data)
    for item in root.findall('./channel/item')[:3]:
        title = item.find('title').text
        approx_traffic = item.find('{https://trends.google.com/trending/rss}approx_traffic').text
        print(f"Trend: {title}, Traffic: {approx_traffic}")
except Exception as e:
    print(f"Error: {e}")
