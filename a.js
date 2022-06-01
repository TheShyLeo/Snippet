const CryptoJS = require("crypto-js");
function aesDecode(encryptedStr,pid) {
    let iv = "";
    for (let i = 2; i < 18; i++) {
        iv += (pid % i) % 9;
    }
    let encryptedHexStr  = CryptoJS.enc.Hex.parse(encryptedStr);
    let encryptedBase64Str  = CryptoJS.enc.Base64.stringify(encryptedHexStr);
    let t = "e08ae5dda7eaced440b2685e04bb3662"
    let a = CryptoJS.enc.Utf8.parse(pid+t).toString();
    let t1 = "e08ae 5dda7 eaced 440b2 685e0 4bb36 62"
    let key = CryptoJS.MD5(CryptoJS.enc.Utf8.parse(pid+t)).toString().substr(8,16);
    key = CryptoJS.enc.Utf8.parse(key);
    let decryptedData  = CryptoJS.AES.decrypt(encryptedBase64Str, key, {
        iv:CryptoJS.enc.Utf8.parse(iv),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    });
    return JSON.parse(decryptedData.toString(CryptoJS.enc.Utf8));
}
let str = 'a4028ab58b2c6aa3bd43fe748ac2b46a838197cac34a0e2d8cb90884760a55a99222f91ea9d9bd2b3dc8d34aef8d831f3ede839dcc9cd84046bc035b303eb1f30cf9539a0fdb3337ebc933217ea8df4f053ccd877dc6fe8d56b5708186584c0638fcf09fbc4c57c120f7859401dcfb45d4c2f062aef775c3dc594cba0c763fe94511bad53828062ed8eb653650caea3c1f14b7038298052fa55c9506f716fa2b068db871ac013d258285645ec3354e2673903006fed29fcaa50386f2e9d8aa5049033b451b4b77c521266f9c11950bb02a62828cfd5d37b794e4a6cbeca6b17e0427e624fe74491cf5b02abb8a2eb8032d4bb137290768cb745a980fb0047467d3f638a31e068afcd2b05fc490159c2fab75643513d99625ceee7be86a354015774ea840e16919fd862a43764f29a7d1928f3b10adda9342c41ed59f72b7fa8170427c3cfd4fea89ebc884ee76eccd71a838d7f4220cdf03567a3b192446b30d0c57e3e64e329d40f629962e1d52e55d6bf9b5f1caab7baef1d712042f50ec4040c6da5efab31a7197da0cb491446bfa566c1dbcd86434b83a5309f8f1a58d27e7325a08c8bc278d905dd177a6cce9358ee9e8ffdea2f4695bbe0b96fac967002b887f5185759f3a8ed39537021046d56f3a1586606a3ff30c09f1efba8515b407ca689b8ca9e7245bcab676eb398e8c4bc9b6fab73aa59160acb62fbe1f11cb700f00bd3e5d6b0f573654332d2ee8873c1a6350dac2caa10e549127ef196f5c36fd83c21ade87b1c004f8b7559c1cd8545302935f0ecfe2930de8da1bf3b40ad9f9607dbf316fb516b1af36a9c5c1bbf6c649b4f068255952760427aae3e9377bb7205f9e50d3649ac53e36175818813037bbd36ecf804f8e221c9214787c478c3f86d4172bac37f5c654cf806e3c825ea3aca9251d3201bb9792c0c19c4f12dd174588e95b067fef699e08ed520b6a6b3e09b48fed458d15387212387f01270669466cc2c0175a3b265c6efb7c0875579ddf46a3d7c3d72933625d315146d8286f870306250268568163c4daa73b302941d72e8b75bb5fcdb0e8cc9d5b9d6d818dee17b59e563dbc8bfec5092405621a62d496f435c3f6dd0fe9db33894340dc5a1a2ef948ba0b23e13e81520a5202988c8037da0c66782b017ead3dcb307f07ef3fec59383a479989cde79503a79df602c84cbc1bfa9d1126f747adb93d304a3e54331a18b8113e22bbbcf14255675853e2355855431f389c5b6a8fc92cd0';
let pid = 65805;
let result = aesDecode(str,pid);
console.log(result);
//\x64\x6d\x70\x47\x66

//seo wxy iyc mda mhp vgg xza xsk noe mah arc