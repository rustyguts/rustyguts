---
title: "Chunk Based Transcoding with FFmpeg"
date: 2022-07-12T15:45:28-04:00
draft: true
---

Video transcoding has always been a CPU intensive task. While we are starting to see GPUs and even [custom silicon](https://arstechnica.com/gadgets/2021/04/youtube-is-now-building-its-own-video-transcoding-chips/) being used, the vast majority of video transcoding is still done on your run of the mill server.

In the old days, videos for the web were a single resolution. The user would upload a 720p clip and the site would compress the video to a size and bitrate that most people could stream. And with only one file being used, serial video transcoding was enough.

Fast forward to the modern web video landscape. We have higher bitrate content and multiple resolutions to choose from. What was once a single video file is now potentially a dozen multi-bitrate renditions. So is serial processing still effective today? The short answer is no. But there are many reasons why improving video transcoding efficiency can be a rabbit hole you may never come out of.

> Parallel processing is a method in computing of running two or more processors (CPUs) to handle separate parts of an overall task.

Let's take a 4k on [YouTube](https://youtu.be/njX2bu-_Vw4) for example.

`youtube-dl -F https://youtu.be/njX2bu-_Vw4`

```
format code  extension  resolution note
249          webm       audio only tiny   49k , webm_dash container, opus @ 49k (48000Hz), 768.69KiB
250          webm       audio only tiny   66k , webm_dash container, opus @ 66k (48000Hz), 1024.00KiB
140          m4a        audio only tiny  129k , m4a_dash container, mp4a.40.2@129k (44100Hz), 1.95MiB
251          webm       audio only tiny  133k , webm_dash container, opus @133k (48000Hz), 2.02MiB
256          m4a        audio only tiny  195k , m4a_dash container, mp4a.40.5@195k (24000Hz), 2.95MiB
380          m4a        audio only tiny  384k , m4a_dash container, ac-3 @384k (48000Hz), 5.80MiB
328          m4a        audio only tiny  384k , m4a_dash container, ec-3 @384k (48000Hz), 5.80MiB
258          m4a        audio only tiny  387k , m4a_dash container, mp4a.40.2@387k (48000Hz), 5.85MiB
160          mp4        256x144    144p   35k , mp4_dash container, avc1.4d400c@  35k, 30fps, video only, 546.55KiB
278          webm       256x144    144p   67k , webm_dash container, vp9@  67k, 30fps, video only, 1.02MiB
694          mp4        256x144    144p60 HDR  135k , mp4_dash container, av01.0.00M.10.0.110.09.16.09.0@ 135k, 60fps, video only, 2.04MiB
330          webm       256x144    144p60 HDR  159k , webm_dash container, vp9.2@ 159k, 60fps, video only, 2.41MiB
133          mp4        426x240    240p   78k , mp4_dash container, avc1.4d4015@  78k, 30fps, video only, 1.18MiB
242          webm       426x240    240p  105k , webm_dash container, vp9@ 105k, 30fps, video only, 1.58MiB
695          mp4        426x240    240p60 HDR  287k , mp4_dash container, av01.0.01M.10.0.110.09.16.09.0@ 287k, 60fps, video only, 4.33MiB
331          webm       426x240    240p60 HDR  350k , webm_dash container, vp9.2@ 350k, 60fps, video only, 5.28MiB
134          mp4        640x360    360p  171k , mp4_dash container, avc1.4d401e@ 171k, 30fps, video only, 2.59MiB
243          webm       640x360    360p  260k , webm_dash container, vp9@ 260k, 30fps, video only, 3.92MiB
696          mp4        640x360    360p60 HDR  593k , mp4_dash container, av01.0.04M.10.0.110.09.16.09.0@ 593k, 60fps, video only, 8.95MiB
332          webm       640x360    360p60 HDR  758k , webm_dash container, vp9.2@ 758k, 60fps, video only, 11.44MiB
135          mp4        854x480    480p  294k , mp4_dash container, avc1.4d401f@ 294k, 30fps, video only, 4.44MiB
244          webm       854x480    480p  487k , webm_dash container, vp9@ 487k, 30fps, video only, 7.35MiB
697          mp4        854x480    480p60 HDR 1111k , mp4_dash container, av01.0.05M.10.0.110.09.16.09.0@1111k, 60fps, video only, 16.76MiB
333          webm       854x480    480p60 HDR 1449k , webm_dash container, vp9.2@1449k, 60fps, video only, 21.86MiB
247          webm       1280x720   720p  995k , webm_dash container, vp9@ 995k, 30fps, video only, 15.01MiB
136          mp4        1280x720   720p 1108k , mp4_dash container, avc1.4d401f@1108k, 30fps, video only, 16.72MiB
302          webm       1280x720   720p60 1573k , webm_dash container, vp9@1573k, 60fps, video only, 23.73MiB
298          mp4        1280x720   720p60 1923k , mp4_dash container, avc1.4d4020@1923k, 60fps, video only, 29.01MiB
698          mp4        1280x720   720p60 HDR 3125k , mp4_dash container, av01.0.08M.10.0.110.09.16.09.0@3125k, 60fps, video only, 47.14MiB
334          webm       1280x720   720p60 HDR 3502k , webm_dash container, vp9.2@3502k, 60fps, video only, 52.82MiB
303          webm       1920x1080  1080p60 2800k , webm_dash container, vp9@2800k, 60fps, video only, 42.23MiB
299          mp4        1920x1080  1080p60 3433k , mp4_dash container, avc1.64002a@3433k, 60fps, video only, 51.78MiB
699          mp4        1920x1080  1080p60 HDR 5094k , mp4_dash container, av01.0.09M.10.0.110.09.16.09.0@5094k, 60fps, video only, 76.84MiB
335          webm       1920x1080  1080p60 HDR 5774k , webm_dash container, vp9.2@5774k, 60fps, video only, 87.10MiB
308          webm       2560x1440  1440p60 8300k , webm_dash container, vp9@8300k, 60fps, video only, 125.20MiB
700          mp4        2560x1440  1440p60 HDR 13641k , mp4_dash container, av01.0.12M.10.0.110.09.16.09.0@13641k, 60fps, video only, 205.76MiB
336          webm       2560x1440  1440p60 HDR 15016k , webm_dash container, vp9.2@15016k, 60fps, video only, 226.49MiB
315          webm       3840x2160  2160p60 20613k , webm_dash container, vp9@20613k, 60fps, video only, 310.91MiB
701          mp4        3840x2160  2160p60 HDR 25053k , mp4_dash container, av01.0.13M.10.0.110.09.16.09.0@25053k, 60fps, video only, 377.89MiB
337          webm       3840x2160  2160p60 HDR 27633k , webm_dash container, vp9.2@27633k, 60fps, video only, 416.80MiB
18           mp4        640x360    360p  474k , avc1.42001E, 30fps, mp4a.40.2 (44100Hz), 7.17MiB
22           mp4        1280x720   720p 1953k , avc1.64001F, 30fps, mp4a.40.2 (44100Hz) (best)
```

**Forty three.** There are forty three distinct assets that make up this video. YouTube has AV1, AVC, and VP9 video encodes for multiple resolutions. Additionally, there are multiple audio streams and a few fallback feeds. Suffice to say that modern web video has gotten complex.

In 2019. I set out to make a video transcoder that could use chunk based strategies to encode all this content faster then the old-school serial workflows. I did it, I learned a lot, and it sucked.

### Single node chunked encoding

```bash
# Chunked Transcoding Example

# Set aside the audio, we will use this later
ffmpeg -i source.mp4 -c copy -an out.wav

# Split the video up into chunks about 10 seconds long
# I-Frames are used to find split points
ffmpeg -i source.mp4 -f segment out.mp4

#

```

### Network limited?

### The not so simple method

### Netflix
