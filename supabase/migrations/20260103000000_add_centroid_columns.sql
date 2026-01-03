-- Add centroid and distance calculation columns to trials table
ALTER TABLE trials
ADD COLUMN centroid_x FLOAT,
ADD COLUMN centroid_y FLOAT,
ADD COLUMN focal_distance_from_centroid FLOAT,
ADD COLUMN avg_distance_from_centroid FLOAT,
ADD COLUMN focal_distance_to_neighbor FLOAT;
