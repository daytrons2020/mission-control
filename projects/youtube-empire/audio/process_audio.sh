#!/bin/bash
# Process TTS audio for YouTube Empire channels
# Usage: ./process_audio.sh input.mp3 channel_type output.mp3
# channel_type: education, stories, lofi

set -e

if [ $# -lt 3 ]; then
    echo "Usage: $0 input.mp3 channel_type output.mp3"
    echo "Channel types: education, stories, lofi"
    exit 1
fi

INPUT="$1"
CHANNEL="$2"
OUTPUT="$3"

if [ ! -f "$INPUT" ]; then
    echo "Error: Input file not found: $INPUT"
    exit 1
fi

echo "Processing: $INPUT"
echo "Channel type: $CHANNEL"
echo "Output: $OUTPUT"

if [ "$CHANNEL" == "education" ]; then
    echo "Applying Education channel processing..."
    ffmpeg -y -i "$INPUT" -af "\
        highpass=f=80, \
        equalizer=f=3000:t=q:w=1:g=3, \
        acompressor=threshold=-18dB:ratio=3:attack=200:release=1000, \
        loudnorm=I=-16:TP=-3:LRA=11" \
        -ar 48000 -b:a 192k "$OUTPUT"
        
elif [ "$CHANNEL" == "stories" ]; then
    echo "Applying Stories channel processing..."
    ffmpeg -y -i "$INPUT" -af "\
        highpass=f=60, \
        equalizer=f=300:t=q:w=2:g=2, \
        equalizer=f=8000:t=q:w=1:g=-2, \
        aecho=0.8:0.9:60:0.3, \
        acompressor=threshold=-20dB:ratio=2:attack=300:release=1000, \
        loudnorm=I=-16:TP=-3:LRA=11" \
        -ar 48000 -b:a 192k "$OUTPUT"
        
elif [ "$CHANNEL" == "lofi" ]; then
    echo "Applying Lofi channel processing..."
    ffmpeg -y -i "$INPUT" -af "\
        highpass=f=200, \
        lowpass=f=6000, \
        aecho=0.6:0.8:100:0.5, \
        volume=0.3, \
        loudnorm=I=-20:TP=-6:LRA=15" \
        -ar 48000 -b:a 192k "$OUTPUT"
        
else
    echo "Error: Unknown channel type: $CHANNEL"
    echo "Valid types: education, stories, lofi"
    exit 1
fi

echo "✓ Processing complete: $OUTPUT"
