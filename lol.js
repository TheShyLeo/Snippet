const {request, connect, authenticate } = require('league-connect')
const fetch = require('node-fetch');
const https = require('https');
const httpsAgent = new https.Agent({
    rejectUnauthorized: false,
  });

async function getcCredentials() {
    const credentials = await authenticate()
    console.log(credentials) // { password: '37dn2gsxH3ns', port: 37241 }
    const ws = await connect(credentials)
    ws.on('message', message => {
        // Subscribe to any websocket event
        console.log(message)
    })
    const response = await request({
        method: 'GET',
        url: '/lol-summoner/v1/current-summoner'
      }, credentials)
    let data = await response.text();
    console.log(data)
    
    let res = await req('/lol-summoner/v1/current-summoner','GET',credentials);
    console.log(res)
}

async function req(url,method,credentials){
    let baseUrl = `https://riot:${credentials.password}@127.0.0.1:${credentials.port}`
    url = baseUrl + url;
    let res =  await fetch(url, { method,agent: httpsAgent });
    let data = await res.text();
    return data
}
getcCredentials()

