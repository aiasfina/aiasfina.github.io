---
layout: post
title: 'PhotoShop 导入图片序列制作 GIF 动画'
date: 2014-09-11
disqus: y
---

1. 从 AE 中导出图片序列

2. 打开 PS，选择 **[文件]** -> **[脚本]** -> **[将文件载入堆栈...]**

3. 导入文件或文件夹，等待图层加载完毕

4. 打开 **[窗口]** -> **[时间轴]** 开启时间轴面板，我用的是 CS6，旧版本如果没有 [时间轴] 的话看看是否有 **[动画]**

5. 点开时间轴面板右上的扩展菜单按钮，选择 **[从图层建立帧]**

6. 左下角播放查看，如果是倒序播放的话选择扩展菜单的 **[反向帧]**

7. 完成后选择 **[文件]** -> **[存储为Web和设备所用格式...]**，右上角下拉框中选择 GIF 格式，点击 **[存储]**


**********************************************************************

AE 导出提示：

1. 导出前先把合成的帧数从 25 改到 16 或者更低

2. 不用在 AE 中缩小图片像素，PS 中操作风味更佳

3. 图片序列选择 PNG 格式，JPEG 格式会使 GIF 格式变得很大，而且不保留 alpha 信息（GIF 和 PNG 支持 alpha，JPEG 反之）

4. 选择扩展菜单中的 **[选择全部帧]**，将全部帧延迟都改为 0.06 秒

5. 要有效地缩小GIF体积，可在导出时选择 **[可选择]**，默认 **[可感知]**