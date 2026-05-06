import sqlite3
import matplotlib.pyplot as plt
import os

# Connect to the database
db_path = 'pharmacy.db'
if not os.path.exists(db_path):
    print(f'Database not found at {db_path}')
    exit(1)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Fetch validation scores
cursor.execute('SELECT extraction_confidence FROM prescriptions WHERE extraction_confidence IS NOT NULL')
scores = [row[0] for row in cursor.fetchall() if row[0] is not None]
conn.close()

if not scores:
    print('No extraction_confidence data found.')
    exit(0)

print(f"Found {len(scores)} scores: {scores}")

# Create results directory
os.makedirs('results', exist_ok=True)

# Generate histogram
plt.figure(figsize=(10, 6))
plt.hist(scores, bins=10, range=(0, 1), edgecolor='black', alpha=0.7, color='steelblue')
plt.title('AI Extraction Confidence Histogram')
plt.xlabel('Confidence Score (0.0 to 1.0)')
plt.ylabel('Frequency')
plt.grid(axis='y', alpha=0.75)

# Save image
output_path = 'results/validation_histogram.png'
plt.savefig(output_path)
print(f'Histogram saved to {output_path}')
