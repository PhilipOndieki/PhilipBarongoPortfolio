#!/usr/bin/env bash
#
# Encode a project's preview video and poster for the web.
#
#   npm run media -- <slug> [source-video] [source-image]
#
# Defaults: ./<slug>preview.<webm|mov|mp4> and ./<slug>.<png|jpg|jpeg>
# Output:   public/media/<slug>/<slug>-{720,1280}.mp4 and .webp
#
# Screen recordings are often variable frame rate with a 1 ms timebase.
# -fps_mode vfr keeps the real frames instead of padding to 1000 fps.
#
# yuv420p and +faststart are required: without them Safari may refuse to
# play the file, and playback waits for the whole download.

set -euo pipefail

VIDEO_MAX_BYTES=$((1500 * 1024))
POSTER_MAX_BYTES=$((90 * 1024))

die() { printf 'encode-media: %s\n' "$1" >&2; exit 1; }

find_source() {
  local base=$1; shift
  local ext
  for ext in "$@"; do
    if [[ -f "${base}.${ext}" ]]; then printf '%s' "${base}.${ext}"; return 0; fi
  done
  return 1
}

file_size() { wc -c < "$1" | tr -d ' '; }

command -v ffmpeg >/dev/null 2>&1 || die "ffmpeg is not installed (needs libx264 and libwebp)."

slug=${1:-}
[[ -n "$slug" ]] || die "usage: npm run media -- <slug> [source-video] [source-image]"
[[ "$slug" =~ ^[a-z0-9-]+$ ]] || die "slug must be lowercase letters, digits and dashes: '$slug'"

video_src=${2:-$(find_source "${slug}preview" webm mov mp4 || true)}
image_src=${3:-$(find_source "${slug}" png jpg jpeg || true)}
[[ -f "$video_src" ]] || die "source video not found for '$slug' (pass it as the second argument)."
[[ -f "$image_src" ]] || die "source image not found for '$slug' (pass it as the third argument)."

out_dir="public/media/${slug}"
mkdir -p "$out_dir"

encode_video() {
  local width=$1 crf=$2 profile=$3
  local out="${out_dir}/${slug}-${width}.mp4"
  ffmpeg -hide_banner -loglevel error -y -i "$video_src" \
    -an -fps_mode vfr \
    -vf "scale=${width}:-2:flags=lanczos" \
    -c:v libx264 -preset slow -crf "$crf" -profile:v "$profile" \
    -pix_fmt yuv420p -movflags +faststart \
    "$out"
  printf '%s\n' "$out"
}

encode_poster() {
  local width=$1
  local out="${out_dir}/${slug}-${width}.webp"
  ffmpeg -hide_banner -loglevel error -y -i "$image_src" \
    -vf "scale=${width}:-2:flags=lanczos" \
    -c:v libwebp -quality 75 -compression_level 6 \
    "$out"
  printf '%s\n' "$out"
}

echo "Encoding '${slug}'"
echo "  video: ${video_src}"
echo "  image: ${image_src}"

outputs=(
  "$(encode_video 1280 26 high)"
  "$(encode_video 720 28 main)"
  "$(encode_poster 1280)"
  "$(encode_poster 720)"
)

status=0
for file in "${outputs[@]}"; do
  size=$(file_size "$file")
  limit=$POSTER_MAX_BYTES
  [[ "$file" == *.mp4 ]] && limit=$VIDEO_MAX_BYTES
  mark="ok"
  if (( size > limit )); then mark="OVER BUDGET ($((limit / 1024)) KB)"; status=1; fi
  printf '  %-44s %6d KB  %s\n' "$file" "$((size / 1024))" "$mark"
done

exit "$status"
