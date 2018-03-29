/**
 * Created by Administrator on 2018/3/29.
 */
// 初始化内容
$(function () {
    $("#url").val(localStorage.getItem("url"));
    $("#token").val(localStorage.getItem("token"));
    $("#content").val(localStorage.getItem("content"));
    $("#img").val(localStorage.getItem("img"));
    $("#imgs").val(localStorage.getItem("imgs"));
});
//ok
$("#ok").click(function () {
    $("#result").text("");
    //变量
    var URL = $("#url").val();
    var patt = /html:\\\\/;
    var token = $("#token").val();
    var content = $("#content").val();
    var img = $("#img").val();
    var imgs = $("#imgs").val();

    localStorage.setItem("url", URL);
    localStorage.setItem("token", token);
    localStorage.setItem("content", content);
    localStorage.setItem("img", img);
    localStorage.setItem("imgs", imgs);
    //AES密钥
    var aesKey = randomWord(false, 16);
    console.log("aes密钥" + aesKey);
    //AES加密token
    token = aesEncrypt(token, aesKey);
    console.log("加密后token:" + JSON.parse(token.toString()).ct);
    //AES加密content
    content = aesEncrypt(content, aesKey);
    console.log("加密后content:" + JSON.parse(content.toString()).ct);
    //RSA加密AES密钥
    aesKey = rsaEncrypt(aesKey);
    console.log("加密后aes密钥" + aesKey);
    var header = {
        aesKey: aesKey,
        token: JSON.parse(token.toString()).ct
    };
    var params = {
        content: JSON.parse(content.toString()).ct,
        img: img,
        imgs: imgs
    };
    ajax("POST", URL, header, params, success, error);
});
//success
function success(d, status, request) {
    var p = $("#result");
    p.append("<p>Body</p>");
    p.append(JSON.stringify(d, null, 2));
    p.append("<p>Header</p>");
    p.append(request.getAllResponseHeaders());
    p.css("color", "green")
}
//error
function error(e, status, request) {
    var p = $("#result");
    p.append("<p>Body</p>");
    p.append(JSON.stringify(e, null, 2));
    p.append("<p>Header</p>");
    p.append(request.getAllResponseHeaders());
    p.css("color", "red")
}
//aes加密
function aesEncrypt(aesData, aesKey) {
    return CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(aesData), CryptoJS.enc.Utf8.parse(aesKey), {
        iv: CryptoJS.enc.Utf8.parse('A-16-Byte-String'),
        format: JsonFormatter
    });
}

//rsa加密
var rsaEncrypt = function (text) {
    var encrypt = new JSEncrypt();
    encrypt.setPublicKey('MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAwpSfAOPMqCqQHU6qQpgHTTnOBzi4+J5O5en6VixuDRtdzi1p0ByG/IdSOoLgSchLenOHWWXKIvmWPPI+Ct8wDwmDQMeBxhuPxYtLBtiJRFcd1OLPY0HT4oNy86VYNpuDUXOA82vdRnq/PPVVsl0t7Spipb48rVw0lqcWCZXSOsebvPcQS5vi0ks+W2pXbN7rr6aRgHeplw25FAxIqv/0C5jDGQiOtrdkgt/B3HlI9xdUR4ru6qUnEvWERr2VDp8oy/7uw3OG7in+MB4CJv+FXyUnrjhudtni6Q3RRDdn1q6qanGZLLjV6flgBhVPdnxccQG/07AAtMJDQhwFp9pIaQIDAQAB');
    return encrypt.encrypt(text);
};
// json
var JsonFormatter = {
    stringify: function (cipherParams) { // create json object with ciphertext
        var jsonObj = {ct: cipherParams.ciphertext.toString(CryptoJS.enc.Base64)}; // optionally add iv and salt
        if (cipherParams.iv) {
            jsonObj.iv = cipherParams.iv.toString();
        }
        if (cipherParams.salt) {
            jsonObj.s = cipherParams.salt.toString();
        } // stringify json object
        return JSON.stringify(jsonObj);
    }, parse: function (jsonStr) { // parse json string
        var jsonObj = JSON.parse(jsonStr); // extract ciphertext from json object, and create cipher params object
        var cipherParams = CryptoJS.lib.CipherParams.create({ciphertext: CryptoJS.enc.Base64.parse(jsonObj.ct)}); // optionally extract iv and salt
        if (jsonObj.iv) {
            cipherParams.iv = CryptoJS.enc.Hex.parse(jsonObj.iv)
        }
        if (jsonObj.s) {
            cipherParams.salt = CryptoJS.enc.Hex.parse(jsonObj.s)
        }
        return cipherParams;
    }
};
/**
 * 生成随机数
 *
 * @return {string}
 */
function randomWord(randomFlag, min, max) {
    var str = "",
        range = min,
        arr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

    // 随机数产生
    if (randomFlag) {
        range = Math.round(Math.random() * (max - min)) + min;
    }
    var pos;
    for (var i = 0; i < range; i++) {
        pos = Math.round(Math.random() * (arr.length - 1));
        str += arr[pos];
    }
    return str;
}
//    ajax
function ajax(type, url, header, params, success, error) {
    $.ajax({
        type: type,
        timeout: 300000,
        url: url,
        contentType: 'application/x-www-form-urlencoded',
        // 设置header
        beforeSend: function (xhr) {
            xhr.setRequestHeader("aesKey", header.aesKey);
            xhr.setRequestHeader("token", header.token);
        },
        data: $.param(params),
        success: function (d, status, request) {
            success(d, status, request);
        },
        error: function (e, status, request) {
            error(e, status, request);
        }
    })
}