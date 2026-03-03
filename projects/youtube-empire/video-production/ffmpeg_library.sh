#!/bin/bash
# FFmpeg Script Library for YouTube Empire
# Usage: source ./ffmpeg_library.sh

# ============================================
# BASIC VIDEO CREATION
# ============================================

# Create video from single image + audio (any duration)
# Usage: create_video_from_image image.jpg audio.mp3 output.mp4
create_video_from_image() {
    local image="$1"
    local audio="$2"
    local output="$3"
    ffmpeg -loop 1 -i "$image" -i "$audio" \
           -c:v libx264 -tune stillimage -c:a aac -b:a 192k \
           -pix_fmt yuv420p -shortest "$output"
}

# Create video from multiple images (specify duration per image)
# Usage: create_video_from_images 5 "img*.jpg" output.mp4
create_video_from_images() {
    local duration="$1"
    local pattern="$2"
    local output="$3"
    ffmpeg -framerate 1/$duration -pattern_type glob -i "$pattern" \
           -c:v libx264 -r 30 -pix_fmt yuv420p "$output"
}

# Create black screen video with audio (for sleep/ambient)
# Usage: create_black_video audio.mp3 3600 output.mp4
create_black_video() {
    local audio="$1"
    local duration="$2"
    local output="$3"
    ffmpeg -f lavfi -i "color=c=black:s=1920x1080:r=1" \
           -i "$audio" -t "$duration" \
           -c:v libx264 -crf 28 -c:a copy -pix_fmt yuv420p "$output"
}

# ============================================
# TEXT OVERLAYS
# ============================================

# Add centered title to video
# Usage: add_title input.mp4 "My Title" output.mp4
add_title() {
    local input="$1"
    local title="$2"
    local output="$3"
    ffmpeg -i "$input" -vf \
           "drawtext=text='$title':fontcolor=white:fontsize=72:x=(w-text_w)/2:y=(h-text_h)/2:fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" \
           -c:a copy "$output"
}

# Add title with background box
# Usage: add_title_box input.mp4 "My Title" output.mp4
add_title_box() {
    local input="$1"
    local title="$2"
    local output="$3"
    ffmpeg -i "$input" -vf \
           "drawbox=y=0:color=black@0.5:width=iw:height=100:t=fill,drawtext=text='$title':fontcolor=white:fontsize=48:x=(w-text_w)/2:y=25:fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" \
           -c:a copy "$output"
}

# ============================================
# AUDIO OPERATIONS
# ============================================

# Mix video audio with background music (music at 30% volume)
# Usage: add_background_music video.mp4 music.mp3 output.mp4
add_background_music() {
    local video="$1"
    local music="$2"
    local output="$3"
    ffmpeg -i "$video" -i "$music" \
           -filter_complex "[1:a]volume=0.3[bg];[0:a][bg]amix=inputs=2:duration=first" \
           -c:v copy "$output"
}

# Loop audio to match video duration
# Usage: loop_audio video.mp4 audio.mp3 output.mp4
loop_audio() {
    local video="$1"
    local audio="$2"
    local output="$3"
    ffmpeg -i "$video" -stream_loop -1 -i "$audio" \
           -shortest -c:v copy -c:a aac "$output"
}

# ============================================
# TRANSITIONS & EFFECTS
# ============================================

# Fade in from black (first 30 frames = 1 sec at 30fps)
# Usage: fade_in input.mp4 output.mp4
fade_in() {
    local input="$1"
    local output="$2"
    ffmpeg -i "$input" -vf "fade=in:0:30" -c:a copy "$output"
}

# Fade out to black (last 5 seconds)
# Usage: fade_out input.mp4 output.mp4
fade_out() {
    local input="$1"
    local output="$2"
    local duration=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$input")
    local start=$(echo "$duration - 5" | bc)
    ffmpeg -i "$input" -vf "fade=out:st=$start:d=5" -c:a copy "$output"
}

# Crossfade between two videos
# Usage: crossfade video1.mp4 video2.mp4 4 output.mp4 (fade at 4 seconds)
crossfade() {
    local v1="$1"
    local v2="$2"
    local offset="$3"
    local output="$4"
    ffmpeg -i "$v1" -i "$v2" \
           -filter_complex "xfade=transition=fade:duration=1:offset=$offset" \
           -c:a copy "$output"
}

# ============================================
# CONCATENATION
# ============================================

# Concatenate multiple videos (create list file first)
# Usage: concat_videos list.txt output.mp4
concat_videos() {
    local list="$1"
    local output="$2"
    ffmpeg -f concat -safe 0 -i "$list" -c copy "$output"
}

# Create concat list file from directory of videos
# Usage: create_concat_list ./clips/ list.txt
create_concat_list() {
    local dir="$1"
    local list="$2"
    for f in "$dir"/*.mp4; do
        echo "file '$f'" >> "$list"
    done
}

# ============================================
# YOUTUBE OPTIMIZED EXPORTS
# ============================================

# Export 1080p optimized for YouTube
# Usage: export_youtube_1080p input.mp4 output.mp4
export_youtube_1080p() {
    local input="$1"
    local output="$2"
    ffmpeg -i "$input" -c:v libx264 -preset slow -crf 18 \
           -c:a aac -b:a 192k -pix_fmt yuv420p \
           -movflags +faststart "$output"
}

# Export 4K optimized for YouTube
# Usage: export_youtube_4k input.mp4 output.mp4
export_youtube_4k() {
    local input="$1"
    local output="$2"
    ffmpeg -i "$input" -c:v libx264 -preset slow -crf 18 \
           -c:a aac -b:a 320k -pix_fmt yuv420p \
           -movflags +faststart "$output"
}

# ============================================
# CHANNEL-SPECIFIC TEMPLATES
# ============================================

# Create 1-hour lofi study video
# Usage: create_lofi_video image.jpg music.mp3 output.mp4
create_lofi_video() {
    local image="$1"
    local music="$2"
    local output="$3"
    ffmpeg -stream_loop -1 -i "$image" -stream_loop -1 -i "$music" \
           -c:v libx264 -t 3600 -pix_fmt yuv420p \
           -vf "fps=30,format=yuv420p" -shortest "$output"
}

# Create 10-hour sleep video (black screen + audio)
# Usage: create_sleep_video rain.mp3 output.mp4
create_sleep_video() {
    local audio="$1"
    local output="$2"
    ffmpeg -f lavfi -i "color=c=black:s=1920x1080:r=1" \
           -stream_loop -1 -i "$audio" -t 36000 \
           -c:v libx264 -crf 28 -c:a copy -pix_fmt yuv420p "$output"
}

# Create kids story video (images + narration + bg music)
# Usage: create_story_video ./pages/ narration.mp3 music.mp3 output.mp4
create_story_video() {
    local pages_dir="$1"
    local narration="$2"
    local music="$3"
    local output="$4"
    ffmpeg -framerate 1/10 -pattern_type glob -i "$pages_dir/*.jpg" \
           -i "$narration" -i "$music" \
           -filter_complex "[1:a][2:a]amix=inputs=2:duration=first[audio]" \
           -map 0:v -map "[audio]" -c:v libx264 -r 30 -pix_fmt yuv420p \
           -shortest "$output"
}

# Create kids education video (images with text + voiceover)
# Usage: create_education_video ./slides/ voiceover.mp3 music.mp3 output.mp4
create_education_video() {
    local slides_dir="$1"
    local voiceover="$2"
    local music="$3"
    local output="$4"
    ffmpeg -framerate 1/5 -pattern_type glob -i "$slides_dir/*.jpg" \
           -i "$voiceover" -i "$music" \
           -filter_complex "[1:a][2:a]amix=inputs=2:duration=first,volume=1.5[audio]" \
           -map 0:v -map "[audio]" -c:v libx264 -r 30 -pix_fmt yuv420p \
           -shortest "$output"
}

# ============================================
# UTILITY FUNCTIONS
# ============================================

# Get video duration in seconds
# Usage: get_duration video.mp4
get_duration() {
    ffprobe -v error -show_entries format=duration -of csv=p=0 "$1"
}

# Extract audio from video
# Usage: extract_audio video.mp4 audio.mp3
extract_audio() {
    ffmpeg -i "$1" -vn -c:a libmp3lame -q:a 2 "$2"
}

# Resize video to 1080p
# Usage: resize_1080p input.mp4 output.mp4
resize_1080p() {
    ffmpeg -i "$1" -vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2" \
           -c:a copy "$2"
}

# Create thumbnail from video frame
# Usage: extract_thumbnail video.mp4 5 thumbnail.jpg (at 5 seconds)
extract_thumbnail() {
    local video="$1"
    local time="$2"
    local output="$3"
    ffmpeg -i "$video" -ss "$time" -vframes 1 "$output"
}

echo "FFmpeg Library loaded! Available functions:"
echo "  create_video_from_image, create_video_from_images, create_black_video"
echo "  add_title, add_title_box"
echo "  add_background_music, loop_audio"
echo "  fade_in, fade_out, crossfade"
echo "  concat_videos, create_concat_list"
echo "  export_youtube_1080p, export_youtube_4k"
echo "  create_lofi_video, create_sleep_video, create_story_video, create_education_video"
echo "  get_duration, extract_audio, resize_1080p, extract_thumbnail"
