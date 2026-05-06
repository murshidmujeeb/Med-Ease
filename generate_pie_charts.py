import matplotlib.pyplot as plt
import os

# Create results directory if it doesn't exist
os.makedirs('results', exist_ok=True)

# Synthetic data for Bill Status Distribution
labels = ['Confirmed', 'Pending', 'Cancelled', 'Flagged for Review']
sizes = [65.4, 22.1, 5.5, 7.0]
colors = ['#2ecc71', '#f1c40f', '#e74c3c', '#3498db']
explode = (0.05, 0, 0, 0)  # Explode the first slice (Confirmed)

plt.figure(figsize=(10, 8))
plt.pie(sizes, explode=explode, labels=labels, colors=colors, autopct='%1.1f%%',
        shadow=True, startangle=140, textprops={'fontsize': 12})

plt.axis('equal')  # Equal aspect ratio ensures that pie is drawn as a circle.
plt.title('MedEase Bill Status Distribution', fontsize=16, pad=20)

output_path = 'results/bill_status_pie_chart.png'
plt.savefig(output_path, dpi=300, bbox_inches='tight')
print(f'Saved: {output_path}')
plt.close()

# Alternative: Inventory Category Distribution
labels_inv = ['Antibiotics', 'Analgesics', 'Cardiac', 'Vitamins', 'Others']
sizes_inv = [30, 25, 15, 20, 10]
colors_inv = ['#8e44ad', '#1abc9c', '#d35400', '#27ae60', '#7f8c8d']

plt.figure(figsize=(10, 8))
plt.pie(sizes_inv, labels=labels_inv, colors=colors_inv, autopct='%1.1f%%',
        startangle=90, counterclock=False, textprops={'fontsize': 12})
plt.axis('equal')
plt.title('Inventory Category Distribution', fontsize=16, pad=20)

output_path_inv = 'results/inventory_category_pie_chart.png'
plt.savefig(output_path_inv, dpi=300, bbox_inches='tight')
print(f'Saved: {output_path_inv}')
plt.close()

print("Pie charts generated successfully in 'results' folder.")
