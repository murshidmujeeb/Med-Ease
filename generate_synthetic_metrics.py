import matplotlib.pyplot as plt
import numpy as np
import os

# Create results directory if it doesn't exist
os.makedirs('results', exist_ok=True)

# Set random seed for reproducibility
np.random.seed(42)

# Set style
plt.style.use('ggplot')

# 1. Extraction Confidence Histogram
# Most scores are high (0.85-0.99), with a few lower outliers
num_samples = 1500
high_scores = np.random.normal(loc=0.94, scale=0.03, size=int(num_samples * 0.85))
medium_scores = np.random.normal(loc=0.75, scale=0.08, size=int(num_samples * 0.12))
low_scores = np.random.normal(loc=0.5, scale=0.15, size=int(num_samples * 0.03))

all_scores = np.concatenate([high_scores, medium_scores, low_scores])
# Clip to valid range [0, 1]
all_scores = np.clip(all_scores, 0, 1.0)

plt.figure(figsize=(10, 6))
plt.hist(all_scores, bins=40, range=(0, 1), edgecolor='black', alpha=0.75, color='royalblue')
plt.title('AI Prescription Extraction Confidence Distribution', fontsize=14, pad=15)
plt.xlabel('Confidence Score', fontsize=12)
plt.ylabel('Number of Prescriptions', fontsize=12)
plt.axvline(all_scores.mean(), color='red', linestyle='dashed', linewidth=2, label=f'Mean: {all_scores.mean():.2f}')
plt.legend()
plt.grid(axis='y', alpha=0.5)
plt.tight_layout()
output_path_conf = 'results/synthetic_extraction_confidence_histogram.png'
plt.savefig(output_path_conf, dpi=300)
print(f'Saved: {output_path_conf}')
plt.close()


# 2. Processing Time Distribution (Log-normal distribution)
# Most take 1.5-3 seconds, some take longer due to complex images
processing_times = np.random.lognormal(mean=0.8, sigma=0.5, size=num_samples)
# Shift minimum time to ~0.5s
processing_times = processing_times + 0.5
# Cap at 15 seconds for realism
processing_times = np.clip(processing_times, 0.5, 15.0)

plt.figure(figsize=(10, 6))
plt.hist(processing_times, bins=50, edgecolor='black', alpha=0.75, color='seagreen')
plt.title('Document Processing Time Distribution', fontsize=14, pad=15)
plt.xlabel('Processing Time (Seconds)', fontsize=12)
plt.ylabel('Frequency', fontsize=12)
plt.axvline(np.median(processing_times), color='orange', linestyle='dashed', linewidth=2, label=f'Median: {np.median(processing_times):.2f}s')
plt.axvline(np.percentile(processing_times, 95), color='red', linestyle='dotted', linewidth=2, label=f'95th %ile: {np.percentile(processing_times, 95):.2f}s')
plt.legend()
plt.grid(axis='y', alpha=0.5)
plt.tight_layout()
output_path_time = 'results/synthetic_processing_time_histogram.png'
plt.savefig(output_path_time, dpi=300)
print(f'Saved: {output_path_time}')
plt.close()


# 3. Accuracy by Field Type (Bar Chart)
fields = ['Generic Name', 'Brand Name', 'Dosage', 'Frequency', 'Patient Name', 'Doctor Name']
accuracies = [96.5, 88.2, 94.1, 91.5, 98.3, 85.7]
colors = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b']

plt.figure(figsize=(10, 6))
bars = plt.bar(fields, accuracies, color=colors, alpha=0.8, edgecolor='black')
plt.title('Extraction Accuracy by Field Type', fontsize=14, pad=15)
plt.xlabel('Extracted Field', fontsize=12)
plt.ylabel('Accuracy (%)', fontsize=12)
plt.ylim(0, 105)

# Add percentage labels on top of bars
for bar in bars:
    yval = bar.get_height()
    plt.text(bar.get_x() + bar.get_width()/2, yval + 1.5, f'{yval}%', ha='center', va='bottom', fontweight='bold')

plt.grid(axis='y', linestyle='--', alpha=0.7)
plt.tight_layout()
output_path_acc = 'results/synthetic_accuracy_by_field.png'
plt.savefig(output_path_acc, dpi=300)
print(f'Saved: {output_path_acc}')
plt.close()

print("All synthetic metric images generated successfully in 'results' folder.")
