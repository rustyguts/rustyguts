---
title: The Basics of Chunked Video Coding
pubDatetime: 2023-05-24T00:00:00Z
featured: false
slug: basics-of-chunked-video-coding
draft: false
tags:
  - video
description: How does chunked video encoding work?
---

As codecs like AV1 and VVC start to permeate through the internet some of us are left wondering if we'll soon see the day where our own content is encoded with these advanced video codecs.

While codecs are generally getting better and better, what is often skipped over is the complexity and time to encode. AV1 can be challenging to encode, especially if quality is important. While hardware encoders are getting better, CPU coding is still better in terms of quality.

That being said, transcoding content to AV1 on a single machine is most of the time just not practical. In this post, I'd like to layout some stuff I've learned while building chunked based transcoding systems.

# Architecture

The basic premise of chunked video coding is to split up a video, process each chunk individually (without audio) and mux the segments back together once everything is done. There are many examples of how to do this on a single machine but scant good examples of how to build a system that can scale across tens or thousands of nodes. I think the reason for this is in part because it's really fucking hard to build a system like this. I've been working on open source approaches to chunked transcoding for years and about every 6 months I start over.

## Segmentation

This step is the process of splitting up the video. Typically, this is done by splitting at or around I-frames. So if you have a large GOP it could be tricky to split up a video.

```bash
ffmpeg -i input.mkv -f segment -c copy -an -segment_time 10 %07d.mkv
```

Notice here that I am specifying the flag `-an` which instructs ffmpeg to skip outputing audio. This is critical when processing chunks of videos. When audio is added to each chunk it changes the timestamps of each chunk very slighlt. Once you mux segments back together you'll find a nasty drift in your A/V sync.

Once segmentation is complete you should have something like this.

```bash
├── segments
│   ├── 001.mkv
│   └── 002.mkv
│   └── 00n.mkv
├── audio.wav
```

With the chunks ready, now we need to transcode them

## Transcoding

Transcoding chunks is just as it sounds. We invoke the same command on each chunk and store the output file.

```bash
ffmpeg -i segments/001.mkv -c:v libsvtav1 -crd 30 -preset 5 transcoded/001.mkv
```

## Concatenation

This is the process of taking our transcoded segments and recombining them

```bash
concat.txt

file 'transcoded/001.mkv'
file 'transcoded/002.mkv'

ffmpeg -f concat -safe 0 -i concat.txt -i audio.wav -c copy output.mp4
```

## I/O Bound

Video encoding is extremely cpu intensive but it is also very I/O heavy. When we take this monolithic process of transcoding a video and break it up into chunks, we have to contend with an enormous amount of network traffic within the system. Instead of processing a 100gb file on a single machine, we may process 100 1gb files on 10 machines. That's a lot of I/O and we need pretty beafy network servers to handle this load.
