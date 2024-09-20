# npm pack doesn't support specifying an output name for the tarball
# this script wraps `npm pack` to allow a name to be set

# Usage: 
# ./pack [package-dir] [output-file]

package_dir=$1
out_dir=$(dirname "$2")
out_filename=$(basename "$2")
tmp_dir="$out_dir/pack_tmp"

mkdir "$tmp_dir"
npm pack "$package_dir" --pack-destination "$tmp_dir"
cp "$tmp_dir/"*.tgz "$out_dir/$out_filename"
rm -r "$tmp_dir"
