for filename in static/images/source/*; do
  FNAME=$(basename $filename)
  NEW_NAME="${FNAME%.*}.webp"
  vips webpsave -Q 80 static/images/source/$FNAME static/images/optimized/$NEW_NAME
done