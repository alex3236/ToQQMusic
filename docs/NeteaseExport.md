# 一种从网易云音乐提取歌单的方式

注意：使用此方法，超过 1000 首音乐的歌单只能提取前 1000 首歌曲，其他歌曲无法提取。

1. 打开并登录 https://music.163.com

2. 找到你的歌单，右键任意元素，选择 `检查`

![3](https://github.com/alex3236/ToQQMusic/assets/45303195/8334c930-99e6-4bdb-87cb-03362622f0f1)

3. 在弹出的面板中选择 `控制台(Console)`，粘贴以下内容并回车（较新浏览器需要按提示解除控制台粘贴限制）：

```javascript
t=document.getElementsByTagName('b');s=document.querySelectorAll('.text>span');r=[];for(i=0;i<t.length;i++){r.push({t:t[i].title,s:s[i].title})};console.log(JSON.stringify(r));
```

4. 提取到的数据会打印在控制台，复制到文本编辑器中，以 `UTF8` 编码保存为 `.json` 文件。

![image](https://github.com/alex3236/ToQQMusic/assets/45303195/a2975594-16fb-4d23-b04b-932b5780bf17)
