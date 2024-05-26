const qqMusic = require("qq-music-api")
const inquirer = require('inquirer')
const fs = require('node:fs')
const { exit } = require("node:process")

async function loadConfig() {
    try {
        if (!fs.existsSync("./config.json")) {
            fs.writeFileSync("./config.json", JSON.stringify({
                cookies: "", dirid: 201
            }, null, 4))
            console.log("配置文件不存在, 已创建默认配置文件")
            exit(0)
        } else {
            let config = JSON.parse(fs.readFileSync("./config.json", 'utf8'))
            if (!config.cookies || !config.dirid) {
                console.error("配置文件格式错误, 请检查后重试")
            }
            return config
        }
    } catch (error) {
        console.error("处理配置文件时发生错误:", error)
        exit(1)
    }
}

async function loadSongList() {
    try {
        let answers = await inquirer.prompt([{
            type: 'input',
            name: 'current_file',
            message: '音乐列表文件路径: '
        }])
        let current_file = answers.current_file
        return await JSON.parse(fs.readFileSync(current_file, 'utf8', 'r'))
    } catch (error) {
        console.error("读取音乐列表文件时发生错误: ", error)
        exit(1)
    }
}

async function getSongs(fullName) {
    try {
        var songs = []
        var result = await qqMusic.api("search", { key: fullName, pageSize: 10 })
        var songList = result.list
        for (var i = 0; i < songList.length; i++) {
            var song = songList[i]
            var name = song.songname
            var singers = song.singer.map(singer => singer.name).join("/")
            var mid = song.songmid
            var fullLine = `${name} - ${singers}`
            songs.push({ name: fullLine, value: mid })
        }
        if (songs.length == 0) {
            return [{ name: "未找到此歌曲", value: 0 }]
        }
        songs.push( new inquirer.Separator())
        songs.push({ name: "没有我想要的歌曲", value: 0 })
        return songs
    } catch (error) {
        console.log(error)
        return [{ name: "搜索时发生错误", value: 0 }]
    }
}

async function chooseSong(obj, dirid) {
    var title = obj.t.replace(/ - [\（(].*[\)）]/i, '').replaceAll(/[（\(\)）]/g, ' ').trim()
    var artist = obj.s
    var fullName = title + ' ' + artist.replace(/\/.*$/g, '')
    var choices = await getSongs(fullName)
    var answers = await inquirer.prompt([
        {
            type: 'list',
            message: `请指定: ${title} - ${artist}`,
            name: 'ans',
            choices: choices,
            pageSize: 12
        }
    ])
    if (answers.ans == 0) {
        console.log("未找到此歌曲")
        return
    }
    try {
        res = await qqMusic.api('songlist/add', { mid: answers.ans, dirid: dirid })
        if (res !== undefined) {
            console.log(res)
        }
    } catch (error) {
        console.error('发生错误: ' + error)
        return
    }
}

async function main() {
    let config = await loadConfig()
    let songList = await loadSongList()
    songList = songList.reverse()

    qqMusic.setCookie(config.cookies)

    for (let i = 0; i < songList.length; i++) {
        const song = songList[i]
        await chooseSong(song, config.dirid)
        fs.writeFileSync("lastLeft.json", JSON.stringify(songList.slice(i + 1), null, 4))
    }

    inquirer.prompt([
        {
            type: 'input',
            name: 'ans',
            message: '已完成所有操作. 按 Enter 退出.'
        }
    ]).then(_ => {
        exit(0)
    })
}

main()
// qqMusic.api('songlist/add', { mid: '002qU5aY3Qu24y', dirid: 201 })
//     .then(res => console.log(res))
//     .catch(err => console.log(err))
