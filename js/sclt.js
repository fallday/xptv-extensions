let headers = {
    'User-Agent': 'okhttp/4.12.0',
}

let appConfig = {
    ver: 20250729,
    title: 'IPTV-SC',
    site: 'https://sclt.iptv.ytwg.xyz:31443',
}

let token = ''

async function getConfig() {
    await getToken()
    appConfig.tabs = await getTabs()
    return jsonify(appConfig)
}

async function getToken() {
    if (typeof($config_str) === 'undefined') return

    let ext_config = argsify($config_str)
    let userId = ext_config.userId
    let userPassword = ext_config.userPassword
    let macAddr = ext_config.macAddress
    let stdId = ext_config.stbId

    let url = appConfig.site + `/getToken?userId=${userId}&userPassword=${userPassword}&macAddr=${macAddr}&stbId=${stdId}`

    const { data } = await $fetch.get(
        url,
        {
            headers: headers,
        }
    )

    const result = argsify(data)
    if (result.code === 200) {
        token = result.msg
    } else {
        token = ''
        $utils.toastInfo('帐号认证失败，请检网络及帐号信息!')
    }
}

async function getTabs() {
    if (!token) return
    try {
        let list = []
        let url = appConfig.site + '/homeContent?token=' + token

        const { data } = await $fetch.get(
            url,
            {
                headers: headers,
            }
        )
        const tagList = argsify(data).class
        list.push({
            name: '推荐',
            ext: {
                id: 'home',
            },
        })
        tagList.forEach((e) => {
            list.push({
                name: e.type_name,
                ext: {
                    id: e.type_id,
                },
            })
        })

        return list
    } catch (error) {
        $print(error)
    }
}

async function getCards(ext) {
    if (!token) return
    ext = argsify(ext)
    let cards = []
    let { id, page = 1 } = ext
    let url = appConfig.site + '/homeContent?token=' + token

    if (id === 'home') {
        if (page >= 2) return
        const { data } = await $fetch.get(
            url,
            {
                headers: headers,
            }
        )
        argsify(data).list.forEach((e) => {
            cards.push({
                vod_id: e.vod_id,
                vod_name: e.vod_name,
                vod_pic: e.vod_pic,
                vod_remarks: e.vod_remarks,
                ext: {
                    id: e.vod_id,
                },
            })
        })

        return jsonify({
            list: cards,
        })
    }

    url = appConfig.site + `/categoryContent?tid=${id}&pg=${page}&token=${token}`

    const { data : data2 } = await $fetch.get(url, {
        headers: headers,
    })

    argsify(data2).list.forEach((e) => {
        cards.push({
            vod_id: e.vod_id,
            vod_name: e.vod_name,
            vod_pic: e.vod_pic,
            vod_remarks: e.vod_remarks,
            ext: {
                id: e.vod_id,
            },
        })
    })

    return jsonify({
        list: cards,
    })
}

async function getTracks(ext) {
    if (!token) return
    ext = argsify(ext)
    let list = []
    let id = ext.id

    let url = appConfig.site + '/detailContent?id=' + encodeURIComponent(id) + '&token=' + token

    const { data } = await $fetch.get(url, {
        headers: headers,
    })

    argsify(data).list.forEach((e) => {
        let play_from = e.vod_play_from.split('$$$')
        let play_url = e.vod_play_url.split('$$$')
        let tracks = []
        for (let i=0; i<play_from.length; i++) {
            play_url[i].split('#').forEach((f) => {
                tracks.push({
                    name: f.split('$')[0],
                    pan: '',
                    ext: {
                        id: f.split('$')[1],
                    },
                })
            })
            list.push({
                title: play_from[i],
                tracks: tracks,
            })
        }
    })

    return jsonify({
        list: list,
    })
}

async function getPlayinfo(ext) {
    if (!token) return
    ext = argsify(ext)
    let id = ext.id

    let url = appConfig.site + '/playerContent?id=' + encodeURIComponent(id) + '&token=' + token

    const { data } = await $fetch.get(url, {
        headers: headers,
    })
    const playUrl = argsify(data).url

    return jsonify({ urls: [playUrl], headers: [headers] })
}

async function search(ext) {
    if (!token) return
    ext = argsify(ext)
    let cards = []

    let text = encodeURIComponent(ext.text)
    let page = ext.page || 1
    if (page >= 2) return
    let url = `${appConfig.site}/searchContent?key=${text}&pg=${page}&token=${token}`

    const { data } = await $fetch.get(url, {
        headers: headers,
    })

    argsify(data).list.forEach((e) => {
        cards.push({
            vod_id: e.vod_id,
            vod_name: e.vod_name,
            vod_pic: e.vod_pic,
            vod_remarks: e.vod_remarks,
            ext: {
                id: e.vod_id,
            },
        })
    })

    return jsonify({
        list: cards,
    })
}
