const PROXY_SOURCES = [
  // ===== TheSpeedX =====
  { name: "TheSpeedX", type: "http", url: "https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/http.txt", repo: "TheSpeedX/PROXY-List", path: "http.txt" },
  { name: "TheSpeedX", type: "socks4", url: "https://raw.githubusercontent.com/TheSpeedX/SOCKS-List/master/socks4.txt", repo: "TheSpeedX/SOCKS-List", path: "socks4.txt" },
  { name: "TheSpeedX", type: "socks5", url: "https://raw.githubusercontent.com/TheSpeedX/SOCKS-List/master/socks5.txt", repo: "TheSpeedX/SOCKS-List", path: "socks5.txt" },

  // ===== monosans =====
  { name: "monosans", type: "http", url: "https://raw.githubusercontent.com/monosans/proxy-list/main/proxies/http.txt", repo: "monosans/proxy-list", path: "proxies/http.txt" },
  { name: "monosans", type: "socks4", url: "https://raw.githubusercontent.com/monosans/proxy-list/main/proxies/socks4.txt", repo: "monosans/proxy-list", path: "proxies/socks4.txt" },
  { name: "monosans", type: "socks5", url: "https://raw.githubusercontent.com/monosans/proxy-list/main/proxies/socks5.txt", repo: "monosans/proxy-list", path: "proxies/socks5.txt" },

  // ===== clarketm =====
  { name: "clarketm", type: "http", url: "https://raw.githubusercontent.com/clarketm/proxy-list/master/proxy-list-raw.txt", repo: "clarketm/proxy-list", path: "proxy-list-raw.txt" },

  // ===== ShiftyTR =====
  { name: "ShiftyTR", type: "http", url: "https://raw.githubusercontent.com/shiftytr/proxy-list/master/proxy.txt", repo: "ShiftyTR/Proxy-List", path: "proxy.txt" },

  // ===== hookzof =====
  { name: "hookzof", type: "socks5", url: "https://raw.githubusercontent.com/hookzof/socks5_list/master/proxy.txt", repo: "hookzof/socks5_list", path: "proxy.txt" },

  // ===== ErcinDedeoglu =====
  { name: "ErcinDedeoglu", type: "http", url: "https://raw.githubusercontent.com/ErcinDedeoglu/proxies/main/proxies/http.txt", repo: "ErcinDedeoglu/proxies", path: "proxies/http.txt" },
  { name: "ErcinDedeoglu", type: "https", url: "https://raw.githubusercontent.com/ErcinDedeoglu/proxies/main/proxies/https.txt", repo: "ErcinDedeoglu/proxies", path: "proxies/https.txt" },
  { name: "ErcinDedeoglu", type: "socks4", url: "https://raw.githubusercontent.com/ErcinDedeoglu/proxies/main/proxies/socks4.txt", repo: "ErcinDedeoglu/proxies", path: "proxies/socks4.txt" },
  { name: "ErcinDedeoglu", type: "socks5", url: "https://raw.githubusercontent.com/ErcinDedeoglu/proxies/main/proxies/socks5.txt", repo: "ErcinDedeoglu/proxies", path: "proxies/socks5.txt" },

  // ===== proxifly (every 5 min) =====
  { name: "proxifly", type: "http", url: "https://raw.githubusercontent.com/proxifly/free-proxy-list/main/proxies/protocols/http/data.txt", repo: "proxifly/free-proxy-list", path: "proxies/protocols/http/data.txt" },
  { name: "proxifly", type: "socks4", url: "https://raw.githubusercontent.com/proxifly/free-proxy-list/main/proxies/protocols/socks4/data.txt", repo: "proxifly/free-proxy-list", path: "proxies/protocols/socks4/data.txt" },
  { name: "proxifly", type: "socks5", url: "https://raw.githubusercontent.com/proxifly/free-proxy-list/main/proxies/protocols/socks5/data.txt", repo: "proxifly/free-proxy-list", path: "proxies/protocols/socks5/data.txt" },

  // ===== jetkai (hourly) =====
  { name: "jetkai", type: "http", url: "https://raw.githubusercontent.com/jetkai/proxy-list/main/online-proxies/txt/proxies-http.txt", repo: "jetkai/proxy-list", path: "online-proxies/txt/proxies-http.txt" },
  { name: "jetkai", type: "https", url: "https://raw.githubusercontent.com/jetkai/proxy-list/main/online-proxies/txt/proxies-https.txt", repo: "jetkai/proxy-list", path: "online-proxies/txt/proxies-https.txt" },
  { name: "jetkai", type: "socks4", url: "https://raw.githubusercontent.com/jetkai/proxy-list/main/online-proxies/txt/proxies-socks4.txt", repo: "jetkai/proxy-list", path: "online-proxies/txt/proxies-socks4.txt" },
  { name: "jetkai", type: "socks5", url: "https://raw.githubusercontent.com/jetkai/proxy-list/main/online-proxies/txt/proxies-socks5.txt", repo: "jetkai/proxy-list", path: "online-proxies/txt/proxies-socks5.txt" },

  // ===== vakhov (every 5-20 min) =====
  { name: "vakhov", type: "http", url: "https://raw.githubusercontent.com/vakhov/fresh-proxy-list/master/http.txt", repo: "vakhov/fresh-proxy-list", path: "http.txt" },
  { name: "vakhov", type: "https", url: "https://raw.githubusercontent.com/vakhov/fresh-proxy-list/master/https.txt", repo: "vakhov/fresh-proxy-list", path: "https.txt" },
  { name: "vakhov", type: "socks4", url: "https://raw.githubusercontent.com/vakhov/fresh-proxy-list/master/socks4.txt", repo: "vakhov/fresh-proxy-list", path: "socks4.txt" },
  { name: "vakhov", type: "socks5", url: "https://raw.githubusercontent.com/vakhov/fresh-proxy-list/master/socks5.txt", repo: "vakhov/fresh-proxy-list", path: "socks5.txt" },

  // ===== prxchk (every 10 min) =====
  { name: "prxchk", type: "http", url: "https://raw.githubusercontent.com/prxchk/proxy-list/main/http.txt", repo: "prxchk/proxy-list", path: "http.txt" },
  { name: "prxchk", type: "socks4", url: "https://raw.githubusercontent.com/prxchk/proxy-list/main/socks4.txt", repo: "prxchk/proxy-list", path: "socks4.txt" },
  { name: "prxchk", type: "socks5", url: "https://raw.githubusercontent.com/prxchk/proxy-list/main/socks5.txt", repo: "prxchk/proxy-list", path: "socks5.txt" },

  // ===== ALIILAPRO (hourly) =====
  { name: "ALIILAPRO", type: "http", url: "https://raw.githubusercontent.com/ALIILAPRO/Proxy/main/http.txt", repo: "ALIILAPRO/Proxy", path: "http.txt" },
  { name: "ALIILAPRO", type: "socks4", url: "https://raw.githubusercontent.com/ALIILAPRO/Proxy/main/socks4.txt", repo: "ALIILAPRO/Proxy", path: "socks4.txt" },
  { name: "ALIILAPRO", type: "socks5", url: "https://raw.githubusercontent.com/ALIILAPRO/Proxy/main/socks5.txt", repo: "ALIILAPRO/Proxy", path: "socks5.txt" },

  // ===== mmpx12 (hourly) =====
  { name: "mmpx12", type: "http", url: "https://raw.githubusercontent.com/mmpx12/proxy-list/master/http.txt", repo: "mmpx12/proxy-list", path: "http.txt" },
  { name: "mmpx12", type: "https", url: "https://raw.githubusercontent.com/mmpx12/proxy-list/master/https.txt", repo: "mmpx12/proxy-list", path: "https.txt" },
  { name: "mmpx12", type: "socks4", url: "https://raw.githubusercontent.com/mmpx12/proxy-list/master/socks4.txt", repo: "mmpx12/proxy-list", path: "socks4.txt" },
  { name: "mmpx12", type: "socks5", url: "https://raw.githubusercontent.com/mmpx12/proxy-list/master/socks5.txt", repo: "mmpx12/proxy-list", path: "socks5.txt" },

  // ===== roosterkid (hourly) =====
  { name: "roosterkid", type: "https", url: "https://raw.githubusercontent.com/roosterkid/openproxylist/main/HTTPS_RAW.txt", repo: "roosterkid/openproxylist", path: "HTTPS_RAW.txt" },
  { name: "roosterkid", type: "socks4", url: "https://raw.githubusercontent.com/roosterkid/openproxylist/main/SOCKS4_RAW.txt", repo: "roosterkid/openproxylist", path: "SOCKS4_RAW.txt" },
  { name: "roosterkid", type: "socks5", url: "https://raw.githubusercontent.com/roosterkid/openproxylist/main/SOCKS5_RAW.txt", repo: "roosterkid/openproxylist", path: "SOCKS5_RAW.txt" },

  // ===== rdavydov (every 30 min) =====
  { name: "rdavydov", type: "http", url: "https://raw.githubusercontent.com/rdavydov/proxy-list/main/proxies/http.txt", repo: "rdavydov/proxy-list", path: "proxies/http.txt" },
  { name: "rdavydov", type: "socks4", url: "https://raw.githubusercontent.com/rdavydov/proxy-list/main/proxies/socks4.txt", repo: "rdavydov/proxy-list", path: "proxies/socks4.txt" },
  { name: "rdavydov", type: "socks5", url: "https://raw.githubusercontent.com/rdavydov/proxy-list/main/proxies/socks5.txt", repo: "rdavydov/proxy-list", path: "proxies/socks5.txt" },

  // ===== Anonym0usWork1221 (every 2h) =====
  { name: "Anonym0usWork1221", type: "http", url: "https://raw.githubusercontent.com/Anonym0usWork1221/Free-Proxies/main/proxy_files/http_proxies.txt", repo: "Anonym0usWork1221/Free-Proxies", path: "proxy_files/http_proxies.txt" },
  { name: "Anonym0usWork1221", type: "https", url: "https://raw.githubusercontent.com/Anonym0usWork1221/Free-Proxies/main/proxy_files/https_proxies.txt", repo: "Anonym0usWork1221/Free-Proxies", path: "proxy_files/https_proxies.txt" },
  { name: "Anonym0usWork1221", type: "socks4", url: "https://raw.githubusercontent.com/Anonym0usWork1221/Free-Proxies/main/proxy_files/socks4_proxies.txt", repo: "Anonym0usWork1221/Free-Proxies", path: "proxy_files/socks4_proxies.txt" },
  { name: "Anonym0usWork1221", type: "socks5", url: "https://raw.githubusercontent.com/Anonym0usWork1221/Free-Proxies/main/proxy_files/socks5_proxies.txt", repo: "Anonym0usWork1221/Free-Proxies", path: "proxy_files/socks5_proxies.txt" },

  // ===== zloi-user (every 10 min) =====
  { name: "zloi-user", type: "http", url: "https://raw.githubusercontent.com/zloi-user/hideip.me/main/http.txt", repo: "zloi-user/hideip.me", path: "http.txt" },
  { name: "zloi-user", type: "https", url: "https://raw.githubusercontent.com/zloi-user/hideip.me/main/https.txt", repo: "zloi-user/hideip.me", path: "https.txt" },
  { name: "zloi-user", type: "socks4", url: "https://raw.githubusercontent.com/zloi-user/hideip.me/main/socks4.txt", repo: "zloi-user/hideip.me", path: "socks4.txt" },
  { name: "zloi-user", type: "socks5", url: "https://raw.githubusercontent.com/zloi-user/hideip.me/main/socks5.txt", repo: "zloi-user/hideip.me", path: "socks5.txt" },

  // ===== Zaeem20 (every 10 min) =====
  { name: "Zaeem20", type: "http", url: "https://raw.githubusercontent.com/Zaeem20/FREE_PROXIES_LIST/master/http.txt", repo: "Zaeem20/FREE_PROXIES_LIST", path: "http.txt" },
  { name: "Zaeem20", type: "https", url: "https://raw.githubusercontent.com/Zaeem20/FREE_PROXIES_LIST/master/https.txt", repo: "Zaeem20/FREE_PROXIES_LIST", path: "https.txt" },
  { name: "Zaeem20", type: "socks4", url: "https://raw.githubusercontent.com/Zaeem20/FREE_PROXIES_LIST/master/socks4.txt", repo: "Zaeem20/FREE_PROXIES_LIST", path: "socks4.txt" },

  // ===== Vann-Dev =====
  { name: "Vann-Dev", type: "http", url: "https://raw.githubusercontent.com/Vann-Dev/proxy-list/main/proxies/http.txt", repo: "Vann-Dev/proxy-list", path: "proxies/http.txt" },
  { name: "Vann-Dev", type: "socks4", url: "https://raw.githubusercontent.com/Vann-Dev/proxy-list/main/proxies/socks4.txt", repo: "Vann-Dev/proxy-list", path: "proxies/socks4.txt" },

  // ===== Thordata (daily, verified) =====
  { name: "Thordata", type: "http", url: "https://raw.githubusercontent.com/Thordata/awesome-free-proxy-list/main/proxies/http.txt", repo: "Thordata/awesome-free-proxy-list", path: "proxies/http.txt" },
  { name: "Thordata", type: "https", url: "https://raw.githubusercontent.com/Thordata/awesome-free-proxy-list/main/proxies/https.txt", repo: "Thordata/awesome-free-proxy-list", path: "proxies/https.txt" },
  { name: "Thordata", type: "socks4", url: "https://raw.githubusercontent.com/Thordata/awesome-free-proxy-list/main/proxies/socks4.txt", repo: "Thordata/awesome-free-proxy-list", path: "proxies/socks4.txt" },
  { name: "Thordata", type: "socks5", url: "https://raw.githubusercontent.com/Thordata/awesome-free-proxy-list/main/proxies/socks5.txt", repo: "Thordata/awesome-free-proxy-list", path: "proxies/socks5.txt" },

  // ===== r00tee (every 5 min) =====
  { name: "r00tee", type: "https", url: "https://raw.githubusercontent.com/r00tee/Proxy-List/main/Https.txt", repo: "r00tee/Proxy-List", path: "Https.txt" },
  { name: "r00tee", type: "socks4", url: "https://raw.githubusercontent.com/r00tee/Proxy-List/main/Socks4.txt", repo: "r00tee/Proxy-List", path: "Socks4.txt" },
  { name: "r00tee", type: "socks5", url: "https://raw.githubusercontent.com/r00tee/Proxy-List/main/Socks5.txt", repo: "r00tee/Proxy-List", path: "Socks5.txt" },

  // ===== ProxyScraper (hourly) =====
  { name: "ProxyScraper", type: "http", url: "https://raw.githubusercontent.com/ProxyScraper/ProxyScraper/main/http.txt", repo: "ProxyScraper/ProxyScraper", path: "http.txt" },
  { name: "ProxyScraper", type: "socks4", url: "https://raw.githubusercontent.com/ProxyScraper/ProxyScraper/main/socks4.txt", repo: "ProxyScraper/ProxyScraper", path: "socks4.txt" },
  { name: "ProxyScraper", type: "socks5", url: "https://raw.githubusercontent.com/ProxyScraper/ProxyScraper/main/socks5.txt", repo: "ProxyScraper/ProxyScraper", path: "socks5.txt" },

  // ===== sunny9577 (every 3h) =====
  { name: "sunny9577", type: "http", url: "https://raw.githubusercontent.com/sunny9577/proxy-scraper/master/generated/http_proxies.txt", repo: "sunny9577/proxy-scraper", path: "generated/http_proxies.txt" },

  // ===== TuanMinPay =====
  { name: "TuanMinPay", type: "http", url: "https://raw.githubusercontent.com/TuanMinPay/live-proxy/master/http.txt", repo: "TuanMinPay/live-proxy", path: "http.txt" },
  { name: "TuanMinPay", type: "socks4", url: "https://raw.githubusercontent.com/TuanMinPay/live-proxy/master/socks4.txt", repo: "TuanMinPay/live-proxy", path: "socks4.txt" },
  { name: "TuanMinPay", type: "socks5", url: "https://raw.githubusercontent.com/TuanMinPay/live-proxy/master/socks5.txt", repo: "TuanMinPay/live-proxy", path: "socks5.txt" },

  // ===== proxylist-to =====
  { name: "proxylist-to", type: "http", url: "https://raw.githubusercontent.com/proxylist-to/proxy-list/main/http.txt", repo: "proxylist-to/proxy-list", path: "http.txt" },
  { name: "proxylist-to", type: "socks4", url: "https://raw.githubusercontent.com/proxylist-to/proxy-list/main/socks4.txt", repo: "proxylist-to/proxy-list", path: "socks4.txt" },
  { name: "proxylist-to", type: "socks5", url: "https://raw.githubusercontent.com/proxylist-to/proxy-list/main/socks5.txt", repo: "proxylist-to/proxy-list", path: "socks5.txt" },

  // ===== im-razvan =====
  { name: "im-razvan", type: "http", url: "https://raw.githubusercontent.com/im-razvan/proxy_list/main/http.txt", repo: "im-razvan/proxy_list", path: "http.txt" },
  { name: "im-razvan", type: "socks5", url: "https://raw.githubusercontent.com/im-razvan/proxy_list/main/socks5.txt", repo: "im-razvan/proxy_list", path: "socks5.txt" },

  // ===== dpangestuw =====
  { name: "dpangestuw", type: "http", url: "https://raw.githubusercontent.com/dpangestuw/Free-Proxy/main/http_proxies.txt", repo: "dpangestuw/Free-Proxy", path: "http_proxies.txt" },
  { name: "dpangestuw", type: "socks4", url: "https://raw.githubusercontent.com/dpangestuw/Free-Proxy/main/socks4_proxies.txt", repo: "dpangestuw/Free-Proxy", path: "socks4_proxies.txt" },
  { name: "dpangestuw", type: "socks5", url: "https://raw.githubusercontent.com/dpangestuw/Free-Proxy/main/socks5_proxies.txt", repo: "dpangestuw/Free-Proxy", path: "socks5_proxies.txt" },

  // ===== Argh94 =====
  { name: "Argh94", type: "http", url: "https://raw.githubusercontent.com/Argh94/Proxy-List/main/HTTP.txt", repo: "Argh94/Proxy-List", path: "HTTP.txt" },
  { name: "Argh94", type: "https", url: "https://raw.githubusercontent.com/Argh94/Proxy-List/main/HTTPS.txt", repo: "Argh94/Proxy-List", path: "HTTPS.txt" },
  { name: "Argh94", type: "socks4", url: "https://raw.githubusercontent.com/Argh94/Proxy-List/main/SOCKS4.txt", repo: "Argh94/Proxy-List", path: "SOCKS4.txt" },
  { name: "Argh94", type: "socks5", url: "https://raw.githubusercontent.com/Argh94/Proxy-List/main/SOCKS5.txt", repo: "Argh94/Proxy-List", path: "SOCKS5.txt" },

  // ===== mzyui (daily) =====
  { name: "mzyui", type: "http", url: "https://raw.githubusercontent.com/mzyui/proxy-list/main/http.txt", repo: "mzyui/proxy-list", path: "http.txt" },
  { name: "mzyui", type: "socks4", url: "https://raw.githubusercontent.com/mzyui/proxy-list/main/socks4.txt", repo: "mzyui/proxy-list", path: "socks4.txt" },
  { name: "mzyui", type: "socks5", url: "https://raw.githubusercontent.com/mzyui/proxy-list/main/socks5.txt", repo: "mzyui/proxy-list", path: "socks5.txt" },

  // ===== iplocate (every 30 min) =====
  { name: "iplocate", type: "http", url: "https://raw.githubusercontent.com/iplocate/free-proxy-list/main/protocols/http.txt", repo: "iplocate/free-proxy-list", path: "protocols/http.txt" },
  { name: "iplocate", type: "https", url: "https://raw.githubusercontent.com/iplocate/free-proxy-list/main/protocols/https.txt", repo: "iplocate/free-proxy-list", path: "protocols/https.txt" },
  { name: "iplocate", type: "socks4", url: "https://raw.githubusercontent.com/iplocate/free-proxy-list/main/protocols/socks4.txt", repo: "iplocate/free-proxy-list", path: "protocols/socks4.txt" },
  { name: "iplocate", type: "socks5", url: "https://raw.githubusercontent.com/iplocate/free-proxy-list/main/protocols/socks5.txt", repo: "iplocate/free-proxy-list", path: "protocols/socks5.txt" },

  // ===== databay-labs =====
  { name: "databay-labs", type: "http", url: "https://raw.githubusercontent.com/databay-labs/free-proxy-list/master/http.txt", repo: "databay-labs/free-proxy-list", path: "http.txt" },
  { name: "databay-labs", type: "socks5", url: "https://raw.githubusercontent.com/databay-labs/free-proxy-list/master/socks5.txt", repo: "databay-labs/free-proxy-list", path: "socks5.txt" },

  // ===== dinoz0rg (checked) =====
  { name: "dinoz0rg", type: "http", url: "https://raw.githubusercontent.com/dinoz0rg/proxy-list/main/checked_proxies/http.txt", repo: "dinoz0rg/proxy-list", path: "checked_proxies/http.txt" },
  { name: "dinoz0rg", type: "socks4", url: "https://raw.githubusercontent.com/dinoz0rg/proxy-list/main/checked_proxies/socks4.txt", repo: "dinoz0rg/proxy-list", path: "checked_proxies/socks4.txt" },
  { name: "dinoz0rg", type: "socks5", url: "https://raw.githubusercontent.com/dinoz0rg/proxy-list/main/checked_proxies/socks5.txt", repo: "dinoz0rg/proxy-list", path: "checked_proxies/socks5.txt" },

  // ===== elliottophellia (checked) =====
  { name: "elliottophellia", type: "http", url: "https://raw.githubusercontent.com/elliottophellia/proxylist/master/results/http/global/http_checked.txt", repo: "elliottophellia/proxylist", path: "results/http/global/http_checked.txt" },
  { name: "elliottophellia", type: "socks4", url: "https://raw.githubusercontent.com/elliottophellia/proxylist/master/results/socks4/global/socks4_checked.txt", repo: "elliottophellia/proxylist", path: "results/socks4/global/socks4_checked.txt" },
  { name: "elliottophellia", type: "socks5", url: "https://raw.githubusercontent.com/elliottophellia/proxylist/master/results/socks5/global/socks5_checked.txt", repo: "elliottophellia/proxylist", path: "results/socks5/global/socks5_checked.txt" },

  // ===== Jakee8718 =====
  { name: "Jakee8718", type: "http", url: "https://raw.githubusercontent.com/Jakee8718/Free-Proxies/main/proxy/http.txt", repo: "Jakee8718/Free-Proxies", path: "proxy/http.txt" },
  { name: "Jakee8718", type: "https", url: "https://raw.githubusercontent.com/Jakee8718/Free-Proxies/main/proxy/https.txt", repo: "Jakee8718/Free-Proxies", path: "proxy/https.txt" },
  { name: "Jakee8718", type: "socks4", url: "https://raw.githubusercontent.com/Jakee8718/Free-Proxies/main/proxy/socks/socks4.txt", repo: "Jakee8718/Free-Proxies", path: "proxy/socks/socks4.txt" },
  { name: "Jakee8718", type: "socks5", url: "https://raw.githubusercontent.com/Jakee8718/Free-Proxies/main/proxy/socks/socks5.txt", repo: "Jakee8718/Free-Proxies", path: "proxy/socks/socks5.txt" },

  // ===== Skillter (every 30 min) =====
  { name: "Skillter", type: "http", url: "https://raw.githubusercontent.com/Skillter/ProxyGather/master/proxies/working-proxies-http.txt", repo: "Skillter/ProxyGather", path: "proxies/working-proxies-http.txt" },
  { name: "Skillter", type: "socks4", url: "https://raw.githubusercontent.com/Skillter/ProxyGather/master/proxies/working-proxies-socks4.txt", repo: "Skillter/ProxyGather", path: "proxies/working-proxies-socks4.txt" },
  { name: "Skillter", type: "socks5", url: "https://raw.githubusercontent.com/Skillter/ProxyGather/master/proxies/working-proxies-socks5.txt", repo: "Skillter/ProxyGather", path: "proxies/working-proxies-socks5.txt" },

  // ===== ClearProxy =====
  { name: "ClearProxy", type: "socks5", url: "https://raw.githubusercontent.com/ClearProxy/checked-proxy-list/main/socks5/raw/all.txt", repo: "ClearProxy/checked-proxy-list", path: "socks5/raw/all.txt" },

  // ===== MuRongPIG (large aggregator) =====
  { name: "MuRongPIG", type: "http", url: "https://raw.githubusercontent.com/MuRongPIG/Proxy-Master/main/http.txt", repo: "MuRongPIG/Proxy-Master", path: "http.txt" },
  { name: "MuRongPIG", type: "socks4", url: "https://raw.githubusercontent.com/MuRongPIG/Proxy-Master/main/socks4.txt", repo: "MuRongPIG/Proxy-Master", path: "socks4.txt" },
  { name: "MuRongPIG", type: "socks5", url: "https://raw.githubusercontent.com/MuRongPIG/Proxy-Master/main/socks5.txt", repo: "MuRongPIG/Proxy-Master", path: "socks5.txt" },
];

module.exports = PROXY_SOURCES;
