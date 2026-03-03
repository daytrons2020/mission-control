import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.patches import FancyBboxPatch, Circle, Ellipse, Polygon, Arc, FancyArrowPatch
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import os

# Output directory
OUTPUT_DIR = "/root/.openclaw/workspace/projects/respiratory-education/images/"
os.makedirs(OUTPUT_DIR, exist_ok=True)

def save_fig(fig, filename):
    """Save figure with consistent settings"""
    filepath = os.path.join(OUTPUT_DIR, filename)
    fig.savefig(filepath, dpi=150, bbox_inches='tight', facecolor='white', edgecolor='none')
    plt.close(fig)
    print(f"Created: {filepath}")

def create_respiratory_system():
    """1. Full respiratory system anatomy"""
    fig, ax = plt.subplots(figsize=(12, 10))
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.set_aspect('equal')
    ax.axis('off')
    
    # Title
    ax.text(50, 97, 'Respiratory System Anatomy', fontsize=18, fontweight='bold', 
            ha='center', va='top', color='#2c3e50')
    
    # Nose (external)
    nose_x = [48, 50, 52, 51, 49, 48]
    nose_y = [88, 92, 88, 85, 85, 88]
    ax.fill(nose_x, nose_y, color='#ffdbac', edgecolor='#8b4513', linewidth=2)
    ax.text(50, 94, 'Nose', fontsize=11, ha='center', fontweight='bold')
    
    # Nasal cavity
    ax.plot([49, 49], [85, 78], color='#ff6b6b', linewidth=8, alpha=0.7)
    ax.plot([51, 51], [85, 78], color='#ff6b6b', linewidth=8, alpha=0.7)
    ax.text(43, 82, 'Nasal\nCavity', fontsize=9, ha='center', color='#c0392b')
    
    # Pharynx
    ax.plot([50, 50], [78, 68], color='#ff6b6b', linewidth=12, alpha=0.7)
    ax.text(56, 73, 'Pharynx', fontsize=9, ha='left', color='#c0392b')
    
    # Larynx
    larynx = patches.Rectangle((46, 62), 8, 6, linewidth=2, edgecolor='#8b4513', 
                                facecolor='#ffdbac', alpha=0.8)
    ax.add_patch(larynx)
    ax.text(50, 65, 'Larynx', fontsize=9, ha='center', fontweight='bold')
    
    # Trachea (windpipe)
    trachea_x = [47, 48, 52, 53]
    trachea_y = [62, 50, 50, 62]
    ax.fill(trachea_x + [47], [62, 50, 50, 62, 62], color='#ff6b6b', alpha=0.6, edgecolor='#c0392b', linewidth=2)
    # Tracheal rings
    for y in [58, 55, 52]:
        ax.plot([47.5, 52.5], [y, y], color='#c0392b', linewidth=1.5)
    ax.text(56, 56, 'Trachea', fontsize=10, ha='left', fontweight='bold', color='#c0392b')
    
    # Right Lung (3 lobes)
    right_lung = patches.Ellipse((65, 38), 22, 35, angle=-5, linewidth=2, 
                                  edgecolor='#2c3e50', facecolor='#e8f4f8', alpha=0.9)
    ax.add_patch(right_lung)
    # Lobe divisions
    ax.plot([60, 72], [48, 46], color='#34495e', linewidth=1.5, linestyle='--')
    ax.plot([62, 74], [35, 32], color='#34495e', linewidth=1.5, linestyle='--')
    ax.text(75, 52, 'Upper Lobe', fontsize=8, ha='left')
    ax.text(76, 40, 'Middle Lobe', fontsize=8, ha='left')
    ax.text(75, 28, 'Lower Lobe', fontsize=8, ha='left')
    ax.text(65, 20, 'Right Lung', fontsize=11, ha='center', fontweight='bold', color='#2980b9')
    
    # Left Lung (2 lobes)
    left_lung = patches.Ellipse((35, 38), 20, 33, angle=5, linewidth=2, 
                                 edgecolor='#2c3e50', facecolor='#e8f4f8', alpha=0.9)
    ax.add_patch(left_lung)
    # Cardiac notch
    notch_x = [30, 32, 35, 38]
    notch_y = [45, 50, 48, 44]
    ax.fill(notch_x + [30], notch_y + [45], color='white', edgecolor='#2c3e50', linewidth=2)
    # Lobe division
    ax.plot([32, 40], [38, 35], color='#34495e', linewidth=1.5, linestyle='--')
    ax.text(22, 48, 'Upper Lobe', fontsize=8, ha='right')
    ax.text(22, 30, 'Lower Lobe', fontsize=8, ha='right')
    ax.text(35, 20, 'Left Lung', fontsize=11, ha='center', fontweight='bold', color='#2980b9')
    
    # Bronchi branching
    # Right main bronchus
    ax.plot([50, 58], [50, 48], color='#ff6b6b', linewidth=6, alpha=0.7)
    ax.plot([58, 62], [48, 55], color='#ff6b6b', linewidth=4, alpha=0.7)
    ax.plot([58, 64], [48, 42], color='#ff6b6b', linewidth=4, alpha=0.7)
    ax.plot([64, 68], [42, 35], color='#ff6b6b', linewidth=3, alpha=0.7)
    # Left main bronchus
    ax.plot([50, 42], [50, 48], color='#ff6b6b', linewidth=6, alpha=0.7)
    ax.plot([42, 38], [48, 55], color='#ff6b6b', linewidth=4, alpha=0.7)
    ax.plot([42, 36], [48, 38], color='#ff6b6b', linewidth=4, alpha=0.7)
    ax.plot([36, 34], [38, 30], color='#ff6b6b', linewidth=3, alpha=0.7)
    ax.text(50, 53, 'Bronchi', fontsize=9, ha='center', color='#c0392b', fontweight='bold')
    
    # Diaphragm
    diaphragm_x = np.linspace(25, 75, 100)
    diaphragm_y = 15 + 3 * np.sin((diaphragm_x - 25) * np.pi / 50)
    ax.fill_between(diaphragm_x, 5, diaphragm_y, color='#d4a574', alpha=0.6, edgecolor='#8b4513', linewidth=2)
    ax.text(50, 10, 'Diaphragm', fontsize=11, ha='center', fontweight='bold', color='#8b4513')
    
    # Color legend
    ax.add_patch(patches.Rectangle((5, 5), 3, 3, facecolor='#ff6b6b', alpha=0.7, edgecolor='#c0392b'))
    ax.text(10, 6.5, 'Deoxygenated (CO₂-rich)', fontsize=8, va='center')
    ax.add_patch(patches.Rectangle((5, 1), 3, 3, facecolor='#4dabf7', alpha=0.7, edgecolor='#1971c2'))
    ax.text(10, 2.5, 'Oxygenated (O₂-rich)', fontsize=8, va='center')
    
    save_fig(fig, 'respiratory_system.png')


def create_lungs_diagram():
    """2. Detailed lung anatomy with bronchial tree"""
    fig, ax = plt.subplots(figsize=(14, 10))
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.set_aspect('equal')
    ax.axis('off')
    
    ax.text(50, 97, 'Lung Anatomy - Bronchial Tree & Lobes', fontsize=18, fontweight='bold', 
            ha='center', va='top', color='#2c3e50')
    
    # Trachea
    ax.plot([48, 48, 52, 52, 48], [85, 70, 70, 85, 85], color='#ff6b6b', linewidth=8, alpha=0.7)
    ax.plot([48, 52], [75, 75], color='#c0392b', linewidth=2)
    ax.plot([48, 52], [80, 80], color='#c0392b', linewidth=2)
    ax.text(50, 88, 'Trachea', fontsize=10, ha='center', fontweight='bold', color='#c0392b')
    
    # Carina
    ax.plot([50], [70], marker='v', markersize=8, color='#c0392b')
    ax.text(50, 67, 'Carina', fontsize=8, ha='center', color='#c0392b')
    
    # Right main bronchus
    ax.plot([50, 65], [70, 65], color='#ff6b6b', linewidth=6, alpha=0.7)
    ax.text(58, 69, 'Right Main\nBronchus', fontsize=8, ha='center', color='#c0392b')
    
    # Left main bronchus
    ax.plot([50, 35], [70, 65], color='#ff6b6b', linewidth=6, alpha=0.7)
    ax.text(42, 69, 'Left Main\nBronchus', fontsize=8, ha='center', color='#c0392b')
    
    # Right lung outline
    right_lung = patches.Ellipse((68, 40), 28, 50, angle=-3, linewidth=2, 
                                  edgecolor='#2c3e50', facecolor='#e8f4f8', alpha=0.6)
    ax.add_patch(right_lung)
    
    # Right lobar bronchi and lobes
    # Upper lobe bronchus
    ax.plot([65, 72], [65, 75], color='#ff6b6b', linewidth=4, alpha=0.7)
    ax.plot([72, 75], [75, 80], color='#ff6b6b', linewidth=3, alpha=0.7)
    ax.plot([72, 78], [75, 72], color='#ff6b6b', linewidth=3, alpha=0.7)
    ax.text(76, 82, 'Upper Lobe', fontsize=9, ha='center', fontweight='bold', color='#2980b9')
    
    # Middle lobe bronchus
    ax.plot([65, 72], [65, 58], color='#ff6b6b', linewidth=4, alpha=0.7)
    ax.plot([72, 76], [58, 62], color='#ff6b6b', linewidth=3, alpha=0.7)
    ax.plot([72, 78], [58, 55], color='#ff6b6b', linewidth=3, alpha=0.7)
    ax.text(80, 58, 'Middle Lobe', fontsize=9, ha='center', fontweight='bold', color='#2980b9')
    
    # Lower lobe bronchus
    ax.plot([65, 68], [65, 45], color='#ff6b6b', linewidth=4, alpha=0.7)
    ax.plot([68, 72], [45, 38], color='#ff6b6b', linewidth=3, alpha=0.7)
    ax.plot([68, 75], [45, 48], color='#ff6b6b', linewidth=3, alpha=0.7)
    ax.plot([72, 76], [38, 32], color='#ff6b6b', linewidth=2, alpha=0.7)
    ax.text(78, 28, 'Lower Lobe', fontsize=9, ha='center', fontweight='bold', color='#2980b9')
    
    # Left lung outline
    left_lung = patches.Ellipse((32, 40), 26, 48, angle=3, linewidth=2, 
                                 edgecolor='#2c3e50', facecolor='#e8f4f8', alpha=0.6)
    ax.add_patch(left_lung)
    
    # Cardiac notch
    notch = patches.Wedge((32, 50), 8, 200, 340, linewidth=2, edgecolor='#2c3e50', facecolor='white')
    ax.add_patch(notch)
    
    # Left lobar bronchi
    # Upper lobe bronchus
    ax.plot([35, 28], [65, 72], color='#ff6b6b', linewidth=4, alpha=0.7)
    ax.plot([28, 24], [72, 78], color='#ff6b6b', linewidth=3, alpha=0.7)
    ax.plot([28, 32], [72, 76], color='#ff6b6b', linewidth=3, alpha=0.7)
    ax.text(24, 82, 'Upper Lobe', fontsize=9, ha='center', fontweight='bold', color='#2980b9')
    
    # Lower lobe bronchus (lingular branch)
    ax.plot([35, 30], [65, 58], color='#ff6b6b', linewidth=4, alpha=0.7)
    ax.plot([30, 26], [58, 62], color='#ff6b6b', linewidth=3, alpha=0.7)
    ax.text(22, 64, 'Lingula', fontsize=8, ha='center', color='#2980b9')
    
    ax.plot([35, 32], [65, 42], color='#ff6b6b', linewidth=4, alpha=0.7)
    ax.plot([32, 28], [42, 35], color='#ff6b6b', linewidth=3, alpha=0.7)
    ax.plot([32, 36], [42, 38], color='#ff6b6b', linewidth=3, alpha=0.7)
    ax.text(24, 28, 'Lower Lobe', fontsize=9, ha='center', fontweight='bold', color='#2980b9')
    
    # Segmental bronchi (small branches)
    for i in range(5):
        ax.plot([75 + i*0.5], [80 - i*2], marker='o', markersize=2, color='#e74c3c')
        ax.plot([78 + i*0.5], [72 - i*2], marker='o', markersize=2, color='#e74c3c')
    
    # Labels
    ax.text(68, 12, 'Right Lung\n(3 Lobes)', fontsize=11, ha='center', fontweight='bold', color='#2c3e50')
    ax.text(32, 12, 'Left Lung\n(2 Lobes)', fontsize=11, ha='center', fontweight='bold', color='#2c3e50')
    
    # Legend
    ax.add_patch(patches.Rectangle((5, 5), 4, 4, facecolor='#ff6b6b', alpha=0.7, edgecolor='#c0392b'))
    ax.text(12, 7, 'Bronchial Tree (Airways)', fontsize=9, va='center')
    ax.add_patch(patches.Rectangle((5, 0), 4, 4, facecolor='#e8f4f8', edgecolor='#2c3e50'))
    ax.text(12, 2, 'Lung Tissue', fontsize=9, va='center')
    
    save_fig(fig, 'lungs_diagram.png')


def create_alveolus_detail():
    """3. Alveolar structure and gas exchange"""
    fig, ax = plt.subplots(figsize=(14, 10))
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.set_aspect('equal')
    ax.axis('off')
    
    ax.text(50, 97, 'Alveolar Structure & Gas Exchange', fontsize=18, fontweight='bold', 
            ha='center', va='top', color='#2c3e50')
    
    # Alveolar sac (cluster of alveoli)
    alveoli_positions = [
        (30, 60, 12), (42, 65, 10), (50, 58, 11), (38, 50, 9),
        (45, 45, 10), (55, 48, 9), (35, 40, 10), (48, 38, 11),
        (60, 55, 10), (58, 42, 9)
    ]
    
    for x, y, r in alveoli_positions:
        alveolus = Circle((x, y), r, linewidth=2, edgecolor='#e74c3c', facecolor='#fadbd8', alpha=0.7)
        ax.add_patch(alveolus)
    
    # Alveolar duct
    duct_x = [20, 25, 30, 35, 40]
    duct_y = [70, 65, 60, 55, 50]
    ax.plot(duct_x, duct_y, color='#ff6b6b', linewidth=12, alpha=0.8, solid_capstyle='round')
    ax.text(18, 72, 'Alveolar Duct', fontsize=9, ha='right', color='#c0392b', fontweight='bold')
    
    # Respiratory bronchiole
    ax.plot([15, 20], [75, 70], color='#ff6b6b', linewidth=8, alpha=0.8)
    ax.text(12, 77, 'Respiratory\nBronchiole', fontsize=8, ha='right', color='#c0392b')
    
    # Capillary network
    capillary_y_base = 50
    for i, (x, y, r) in enumerate(alveoli_positions[:6]):
        # Red blood cells in capillary
        for j in range(3):
            rbc_x = x - 8 + j * 5
            rbc_y = y - 15 + np.sin(rbc_x * 0.3) * 2
            rbc = Ellipse((rbc_x, rbc_y), 4, 2.5, angle=10, 
                         facecolor='#e74c3c', edgecolor='#c0392b', alpha=0.8)
            ax.add_patch(rbc)
    
    # Capillary vessel
    capillary = patches.Rectangle((22, 32), 45, 8, linewidth=2, 
                                   edgecolor='#c0392b', facecolor='#fadbd8', alpha=0.4)
    ax.add_patch(capillary)
    ax.text(50, 28, 'Pulmonary Capillary', fontsize=10, ha='center', fontweight='bold', color='#c0392b')
    
    # Type I pneumocyte (simple squamous epithelium)
    ax.text(50, 75, 'Alveolar Epithelium\n(Type I Pneumocytes)', fontsize=9, ha='center', 
            color='#8e44ad', style='italic')
    
    # Surfactant layer
    for x, y, r in alveoli_positions[:5]:
        theta = np.linspace(0, np.pi, 20)
        surf_x = x + (r-1) * np.cos(theta)
        surf_y = y + (r-1) * np.sin(theta)
        ax.plot(surf_x, surf_y, color='#3498db', linewidth=3, alpha=0.6)
    ax.text(70, 65, 'Surfactant\nLayer', fontsize=8, ha='center', color='#3498db')
    
    # Gas exchange arrows
    # O2 going into blood (blue arrows pointing down)
    ax.annotate('', xy=(35, 42), xytext=(35, 52),
                arrowprops=dict(arrowstyle='->', color='#3498db', lw=3))
    ax.annotate('', xy=(45, 40), xytext=(45, 50),
                arrowprops=dict(arrowstyle='->', color='#3498db', lw=3))
    ax.annotate('', xy=(55, 45), xytext=(55, 55),
                arrowprops=dict(arrowstyle='->', color='#3498db', lw=3))
    ax.text(62, 48, 'O₂', fontsize=14, fontweight='bold', color='#3498db')
    
    # CO2 going out (red arrows pointing up)
    ax.annotate('', xy=(38, 52), xytext=(38, 42),
                arrowprops=dict(arrowstyle='->', color='#e74c3c', lw=3))
    ax.annotate('', xy=(48, 50), xytext=(48, 40),
                arrowprops=dict(arrowstyle='->', color='#e74c3c', lw=3))
    ax.annotate('', xy=(52, 55), xytext=(52, 45),
                arrowprops=dict(arrowstyle='->', color='#e74c3c', lw=3))
    ax.text(22, 48, 'CO₂', fontsize=14, fontweight='bold', color='#e74c3c')
    
    # Alveolar macrophage
    macrophage = Circle((58, 62), 3, linewidth=2, edgecolor='#27ae60', facecolor='#abebc6', alpha=0.8)
    ax.add_patch(macrophage)
    ax.text(65, 62, 'Alveolar\nMacrophage', fontsize=8, ha='left', color='#27ae60')
    
    # Basement membrane label
    ax.text(75, 35, 'Basement\nMembrane', fontsize=8, ha='center', color='#7f8c8d')
    ax.plot([70, 80], [38, 38], color='#7f8c8d', linewidth=1, linestyle='--')
    
    # Legend box
    legend_x, legend_y = 75, 15
    ax.add_patch(patches.Rectangle((legend_x, legend_y), 20, 15, linewidth=1, 
                                    edgecolor='#bdc3c7', facecolor='#f8f9fa', alpha=0.9))
    ax.text(legend_x + 10, legend_y + 13, 'Gas Exchange', fontsize=9, fontweight='bold', ha='center')
    ax.annotate('', xy=(legend_x + 5, legend_y + 8), xytext=(legend_x + 5, legend_y + 3),
                arrowprops=dict(arrowstyle='->', color='#3498db', lw=2))
    ax.text(legend_x + 8, legend_y + 5.5, 'O₂ diffusion', fontsize=8, color='#3498db')
    ax.annotate('', xy=(legend_x + 14, legend_y + 3), xytext=(legend_x + 14, legend_y + 8),
                arrowprops=dict(arrowstyle='->', color='#e74c3c', lw=2))
    ax.text(legend_x + 17, legend_y + 5.5, 'CO₂ diffusion', fontsize=8, color='#e74c3c')
    
    save_fig(fig, 'alveolus_detail.png')


def create_lung_volumes():
    """4. Lung volume graph - spirometry tracing"""
    fig, ax = plt.subplots(figsize=(14, 10))
    
    # Generate spirometry-like data
    t = np.linspace(0, 20, 1000)
    
    # Base breathing pattern
    base = np.zeros_like(t)
    for i, ti in enumerate(t):
        cycle = ti % 4
        if cycle < 2:  # inspiration
            base[i] = 0.5 * (1 - np.cos(np.pi * cycle / 2))
        else:  # expiration
            base[i] = 0.5 * (1 + np.cos(np.pi * (cycle - 2) / 2))
    
    # Scale to tidal volume (TV = 500ml)
    tv = base * 0.5  # 0.5 L
    
    # Add IRV demonstration (deep breath at t=8-10)
    irv = np.zeros_like(t)
    for i, ti in enumerate(t):
        if 8 <= ti <= 10:
            if ti < 9:  # deep inhale
                irv[i] = 3.0 * (1 - np.cos(np.pi * (ti - 8))) / 2
            else:  # exhale
                irv[i] = 3.0 * (1 + np.cos(np.pi * (ti - 9))) / 2
        elif 10 < ti < 12:
            irv[i] = 0
    
    # Add ERV demonstration (forced exhale at t=14-16)
    erv = np.zeros_like(t)
    for i, ti in enumerate(t):
        if 14 <= ti <= 16:
            if ti < 15:  # normal then forced
                erv[i] = -0.5 - 1.0 * (1 - np.cos(np.pi * (ti - 14))) / 2
            else:  # return
                erv[i] = -1.5 * (1 + np.cos(np.pi * (ti - 15))) / 2
    
    # Combine
    volume = tv + irv + erv + 1.2  # Add RV (residual volume) as baseline
    
    # Plot
    ax.fill_between(t, 1.2, volume, alpha=0.3, color='#3498db', label='Tidal Volume (TV)')
    ax.plot(t, volume, color='#2c3e50', linewidth=2)
    ax.axhline(y=1.2, color='#e74c3c', linewidth=2, linestyle='--', label='Residual Volume (RV)')
    
    # Volume labels and annotations
    # RV
    ax.annotate('RV\n(1.2 L)', xy=(1, 0.8), fontsize=10, ha='center', color='#e74c3c', fontweight='bold')
    
    # TV
    ax.annotate('', xy=(3, 1.7), xytext=(3, 1.2),
                arrowprops=dict(arrowstyle='<->', color='#3498db', lw=2))
    ax.text(3.8, 1.45, 'TV\n(0.5 L)', fontsize=9, ha='left', color='#3498db', fontweight='bold')
    
    # IRV
    ax.annotate('', xy=(9, 4.2), xytext=(9, 1.7),
                arrowprops=dict(arrowstyle='<->', color='#27ae60', lw=2))
    ax.text(9.8, 3, 'IRV\n(3.0 L)', fontsize=9, ha='left', color='#27ae60', fontweight='bold')
    
    # ERV
    ax.annotate('', xy=(15, 1.2), xytext=(15, 0.2),
                arrowprops=dict(arrowstyle='<->', color='#f39c12', lw=2))
    ax.text(15.8, 0.7, 'ERV\n(1.1 L)', fontsize=9, ha='left', color='#f39c12', fontweight='bold')
    
    # Capacities
    ax.annotate('', xy=(5, 4.7), xytext=(5, 1.2),
                arrowprops=dict(arrowstyle='<->', color='#9b59b6', lw=2))
    ax.text(5.8, 3, 'VC = IRV + TV + ERV\n(4.6 L)', fontsize=9, ha='left', color='#9b59b6', fontweight='bold')
    
    ax.annotate('', xy=(18, 2.3), xytext=(18, 1.2),
                arrowprops=dict(arrowstyle='<->', color='#e67e22', lw=2))
    ax.text(18.8, 1.75, 'IC = IRV + TV\n(3.5 L)', fontsize=9, ha='left', color='#e67e22', fontweight='bold')
    
    # FRC and TLC labels
    ax.text(17, 0.4, 'FRC = ERV + RV\n(2.3 L)', fontsize=9, ha='center', color='#16a085', fontweight='bold')
    ax.text(10, 5.0, 'TLC = VC + RV\n(5.8 L)', fontsize=10, ha='center', color='#c0392b', fontweight='bold')
    
    # Styling
    ax.set_xlabel('Time (seconds)', fontsize=12, fontweight='bold')
    ax.set_ylabel('Volume (Liters)', fontsize=12, fontweight='bold')
    ax.set_title('Spirometry - Lung Volumes and Capacities', fontsize=16, fontweight='bold', pad=20)
    ax.set_xlim(0, 20)
    ax.set_ylim(0, 5.5)
    ax.grid(True, alpha=0.3, linestyle='--')
    
    # Legend
    ax.legend(loc='upper right', fontsize=9)
    
    # Reference table
    table_text = """Reference Values (Adult Male):
• TV (Tidal Volume): ~500 mL
• IRV (Inspiratory Reserve): ~3000 mL  
• ERV (Expiratory Reserve): ~1100 mL
• RV (Residual Volume): ~1200 mL
• VC (Vital Capacity): ~4600 mL
• IC (Inspiratory Capacity): ~3500 mL
• FRC (Functional Reserve): ~2300 mL
• TLC (Total Lung Capacity): ~5800 mL"""
    
    ax.text(0.02, 0.98, table_text, transform=ax.transAxes, fontsize=8,
            verticalalignment='top', bbox=dict(boxstyle='round', facecolor='#f8f9fa', alpha=0.9))
    
    save_fig(fig, 'lung_volumes.png')


def create_copd_comparison():
    """5. Normal vs COPD lungs comparison"""
    fig, axes = plt.subplots(2, 2, figsize=(14, 12))
    
    # Title
    fig.suptitle('Normal vs COPD Lung Comparison', fontsize=18, fontweight='bold', y=0.98)
    
    # 1. Normal Alveoli
    ax1 = axes[0, 0]
    ax1.set_xlim(0, 10)
    ax1.set_ylim(0, 10)
    ax1.set_aspect('equal')
    ax1.set_title('Normal Alveoli', fontsize=14, fontweight='bold', color='#27ae60')
    
    # Draw normal alveoli - clustered, intact
    positions = [(2, 5), (4, 6), (5, 4), (6.5, 6.5), (7, 3.5), (3, 3), (5.5, 7.5)]
    for x, y in positions:
        circle = Circle((x, y), 1.2, facecolor='#abebc6', edgecolor='#27ae60', linewidth=2)
        ax1.add_patch(circle)
        # Capillary network
        ax1.plot([x-0.5, x+0.5], [y-1.5, y-1.5], color='#e74c3c', linewidth=3, alpha=0.7)
    ax1.text(5, 1, 'Intact alveolar walls\nLarge surface area for gas exchange', 
             ha='center', fontsize=9, style='italic')
    ax1.axis('off')
    
    # 2. Emphysema (COPD)
    ax2 = axes[0, 1]
    ax2.set_xlim(0, 10)
    ax2.set_ylim(0, 10)
    ax2.set_aspect('equal')
    ax2.set_title('Emphysema (COPD)', fontsize=14, fontweight='bold', color='#e74c3c')
    
    # Draw damaged alveoli - enlarged, fewer walls
    damaged = [(2.5, 5, 1.8), (6, 5, 2.2), (4.5, 7.5, 1.5), (4, 2.5, 1.6)]
    for x, y, r in damaged:
        circle = Circle((x, y), r, facecolor='#fadbd8', edgecolor='#e74c3c', linewidth=2)
        ax2.add_patch(circle)
        # Broken walls indication
        ax2.plot([x-r*0.5, x+r*0.5], [y, y], color='white', linewidth=4)
        # Reduced capillaries
        ax2.plot([x-0.3, x+0.3], [y-r-0.3, y-r-0.3], color='#e74c3c', linewidth=2, alpha=0.5)
    
    # Broken alveolar walls
    ax2.annotate('', xy=(8, 6), xytext=(6.5, 5.5),
                arrowprops=dict(arrowstyle='->', color='#c0392b', lw=2))
    ax2.text(8.2, 6, 'Broken\nwalls', fontsize=8, color='#c0392b')
    
    ax2.text(5, 0.5, 'Enlarged air spaces\nLost surface area\nReduced capillaries', 
             ha='center', fontsize=9, style='italic', color='#c0392b')
    ax2.axis('off')
    
    # 3. Normal Bronchus
    ax3 = axes[1, 0]
    ax3.set_xlim(0, 10)
    ax3.set_ylim(0, 10)
    ax3.set_aspect('equal')
    ax3.set_title('Normal Bronchus', fontsize=14, fontweight='bold', color='#27ae60')
    
    # Bronchus tube
    bronchus = patches.Rectangle((3, 2), 4, 6, facecolor='#fadbd8', edgecolor='#27ae60', linewidth=2)
    ax3.add_patch(bronchus)
    
    # Open lumen
    lumen = patches.Rectangle((3.5, 2.5), 3, 5, facecolor='#e8f8f5', edgecolor='#27ae60', linewidth=1)
    ax3.add_patch(lumen)
    
    # Normal mucosa
    ax3.plot([3.5, 6.5], [3, 3], color='#27ae60', linewidth=2)
    ax3.plot([3.5, 6.5], [7, 7], color='#27ae60', linewidth=2)
    
    # Cilia (small lines)
    for y in [3.2, 3.4, 3.6]:
        for x in np.linspace(3.6, 6.4, 8):
            ax3.plot([x, x], [y, y+0.15], color='#27ae60', linewidth=1)
    
    ax3.text(5, 1, 'Open airway\nNormal mucus layer\nFunctional cilia', 
             ha='center', fontsize=9, style='italic')
    ax3.axis('off')
    
    # 4. Chronic Bronchitis
    ax4 = axes[1, 1]
    ax4.set_xlim(0, 10)
    ax4.set_ylim(0, 10)
    ax4.set_aspect('equal')
    ax4.set_title('Chronic Bronchitis (COPD)', fontsize=14, fontweight='bold', color='#e74c3c')
    
    # Inflamed bronchus
    bronchitis = patches.Rectangle((3, 2), 4, 6, facecolor='#fadbd8', edgecolor='#e74c3c', linewidth=3)
    ax4.add_patch(bronchitis)
    
    # Narrowed lumen
    narrowed = patches.Rectangle((4, 2.5), 2, 5, facecolor='#fadbd8', edgecolor='#c0392b', linewidth=1)
    ax4.add_patch(narrowed)
    
    # Thick mucus
    mucus = patches.Rectangle((4, 2.5), 2, 2, facecolor='#f1c40f', edgecolor='#f39c12', alpha=0.7)
    ax4.add_patch(mucus)
    
    # Swollen walls
    ax4.plot([3.3, 3.3], [2.5, 7.5], color='#e74c3c', linewidth=6, alpha=0.5)
    ax4.plot([6.7, 6.7], [2.5, 7.5], color='#e74c3c', linewidth=6, alpha=0.5)
    
    # Inflammation arrows
    ax4.annotate('', xy=(2.5, 5), xytext=(3.2, 5),
                arrowprops=dict(arrowstyle='->', color='#e74c3c', lw=2))
    ax4.text(2.3, 5, 'Inflamed\nwall', fontsize=8, ha='right', color='#e74c3c')
    
    ax4.annotate('', xy=(5, 5.5), xytext=(5, 4.5),
                arrowprops=dict(arrowstyle='->', color='#f39c12', lw=2))
    ax4.text(5, 6, 'Excess\nmucus', fontsize=8, ha='center', color='#f39c12')
    
    ax4.text(5, 1, 'Narrowed airway\nExcess mucus production\nInflamed bronchial walls', 
             ha='center', fontsize=9, style='italic', color='#c0392b')
    ax4.axis('off')
    
    plt.tight_layout()
    save_fig(fig, 'copd_comparison.png')


def create_oxyhemoglobin_curve():
    """6. Oxyhemoglobin dissociation curve"""
    fig, ax = plt.subplots(figsize=(12, 10))
    
    # Generate curve data
    pO2 = np.linspace(0, 100, 500)
    
    # Hill equation for oxyhemoglobin dissociation
    # Normal curve: p50 = 26.6 mmHg, n = 2.7
    n = 2.7
    p50_normal = 26.6
    saO2_normal = 100 * (pO2**n) / (p50_normal**n + pO2**n)
    
    # Right shift (Bohr effect: decreased pH, increased temp, increased 2,3-DPG)
    p50_right = 35
    saO2_right = 100 * (pO2**n) / (p50_right**n + pO2**n)
    
    # Left shift (increased pH, decreased temp, decreased 2,3-DPG)
    p50_left = 20
    saO2_left = 100 * (pO2**n) / (p50_left**n + pO2**n)
    
    # Plot curves
    ax.plot(pO2, saO2_normal, color='#2c3e50', linewidth=3, label='Normal (p50 = 26.6 mmHg)')
    ax.plot(pO2, saO2_right, color='#e74c3c', linewidth=2.5, linestyle='--', label='Right Shift (p50 = 35 mmHg)')
    ax.plot(pO2, saO2_left, color='#3498db', linewidth=2.5, linestyle='--', label='Left Shift (p50 = 20 mmHg)')
    
    # Mark p50 points
    ax.plot([p50_normal], [50], 'o', color='#2c3e50', markersize=10)
    ax.annotate('p50', xy=(p50_normal, 50), xytext=(p50_normal+5, 45),
                fontsize=10, fontweight='bold',
                arrowprops=dict(arrowstyle='->', color='#2c3e50'))
    
    ax.plot([p50_right], [50], 'o', color='#e74c3c', markersize=8)
    ax.plot([p50_left], [50], 'o', color='#3498db', markersize=8)
    
    # Arterial and venous points
    ax.plot([100], [saO2_normal[-1]], 's', color='#27ae60', markersize=10)
    ax.annotate('Arterial\n(pO₂ ≈ 100)', xy=(100, saO2_normal[-1]), xytext=(85, 92),
                fontsize=9, ha='center',
                arrowprops=dict(arrowstyle='->', color='#27ae60'))
    
    ax.plot([40], [75], 's', color='#9b59b6', markersize=10)
    ax.annotate('Venous\n(pO₂ ≈ 40)', xy=(40, 75), xytext=(55, 70),
                fontsize=9, ha='center',
                arrowprops=dict(arrowstyle='->', color='#9b59b6'))
    
    # Shaded regions
    ax.axvspan(60, 100, alpha=0.1, color='#27ae60', label='Normal arterial range')
    ax.axvspan(35, 45, alpha=0.1, color='#9b59b6', label='Normal venous range')
    
    # Labels and styling
    ax.set_xlabel('pO₂ (Partial Pressure of O₂) - mmHg', fontsize=13, fontweight='bold')
    ax.set_ylabel('SaO₂ (Oxygen Saturation) - %', fontsize=13, fontweight='bold')
    ax.set_title('Oxyhemoglobin Dissociation Curve', fontsize=16, fontweight='bold', pad=20)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 105)
    ax.grid(True, alpha=0.3, linestyle='--')
    ax.legend(loc='lower right', fontsize=10)
    
    # Right shift causes box
    right_text = """Right Shift (↑p50):
• ↓ pH (acidosis)
• ↑ Temperature
• ↑ 2,3-DPG
• ↑ CO₂ (Bohr effect)
• Exercise

Effect: Decreased O₂ affinity
→ O₂ release to tissues↑"""
    
    ax.text(0.98, 0.35, right_text, transform=ax.transAxes, fontsize=9,
            verticalalignment='top', horizontalalignment='right',
            bbox=dict(boxstyle='round', facecolor='#fadbd8', edgecolor='#e74c3c', alpha=0.9))
    
    # Left shift causes box
    left_text = """Left Shift (↓p50):
• ↑ pH (alkalosis)
• ↓ Temperature
• ↓ 2,3-DPG
• ↓ CO₂
• Fetal hemoglobin

Effect: Increased O₂ affinity
→ O₂ release to tissues↓"""
    
    ax.text(0.02, 0.35, left_text, transform=ax.transAxes, fontsize=9,
            verticalalignment='top', horizontalalignment='left',
            bbox=dict(boxstyle='round', facecolor='#d6eaf8', edgecolor='#3498db', alpha=0.9))
    
    save_fig(fig, 'oxyhemoglobin_curve.png')


def create_ventilator_waveforms():
    """7. Ventilator waveforms"""
    fig, axes = plt.subplots(3, 1, figsize=(14, 12))
    
    # Generate breath cycle data
    t = np.linspace(0, 6, 600)
    
    # Pressure-time waveform (Volume control)
    pressure = np.zeros_like(t)
    for i, ti in enumerate(t):
        cycle = ti % 3
        if cycle < 1:  # inspiration
            pressure[i] = 5 + 15 * (1 - np.exp(-cycle * 3))
        elif cycle < 2.5:  # plateau/expiratory pause
            pressure[i] = 15 * np.exp(-(cycle - 1) * 0.5)
        else:  # expiration
            pressure[i] = 5 * np.exp(-(cycle - 2.5) * 2)
    
    # Flow-time waveform
    flow = np.zeros_like(t)
    for i, ti in enumerate(t):
        cycle = ti % 3
        if cycle < 1:  # inspiration (constant flow)
            flow[i] = 60
        elif cycle < 1.1:  # pause
            flow[i] = 0
        else:  # expiration
            flow[i] = -45 * np.exp(-(cycle - 1.1) * 1.5)
    
    # Volume-time waveform
    volume = np.zeros_like(t)
    for i, ti in enumerate(t):
        cycle = ti % 3
        if cycle < 1:  # inspiration
            volume[i] = 500 * (cycle / 1)
        elif cycle < 2.5:  # plateau
            volume[i] = 500
        else:  # expiration
            volume[i] = 500 * np.exp(-(cycle - 2.5) * 2)
    
    # Plot 1: Pressure-Time
    ax1 = axes[0]
    ax1.fill_between(t, 0, pressure, alpha=0.3, color='#e74c3c')
    ax1.plot(t, pressure, color='#c0392b', linewidth=2)
    ax1.axhline(y=5, color='#7f8c8d', linestyle='--', alpha=0.5, label='PEEP (5 cmH₂O)')
    ax1.axhline(y=15, color='#e74c3c', linestyle='--', alpha=0.5, label='Peak Pressure')
    
    # Labels
    ax1.annotate('Inspiration', xy=(0.5, 18), fontsize=10, ha='center', fontweight='bold', color='#27ae60')
    ax1.annotate('Plateau', xy=(1.75, 12), fontsize=10, ha='center', fontweight='bold', color='#f39c12')
    ax1.annotate('Expiration', xy=(2.75, 8), fontsize=10, ha='center', fontweight='bold', color='#3498db')
    
    ax1.set_ylabel('Pressure (cmH₂O)', fontsize=12, fontweight='bold')
    ax1.set_title('Ventilator Waveforms - Volume Control Mode', fontsize=16, fontweight='bold')
    ax1.set_xlim(0, 6)
    ax1.set_ylim(0, 25)
    ax1.grid(True, alpha=0.3)
    ax1.legend(loc='upper right', fontsize=9)
    
    # Plot 2: Flow-Time
    ax2 = axes[1]
    ax2.fill_between(t, 0, flow, where=(flow >= 0), alpha=0.3, color='#27ae60', interpolate=True)
    ax2.fill_between(t, 0, flow, where=(flow < 0), alpha=0.3, color='#3498db', interpolate=True)
    ax2.plot(t, flow, color='#2c3e50', linewidth=2)
    ax2.axhline(y=0, color='#7f8c8d', linestyle='-', alpha=0.5)
    
    ax2.annotate('Inspiratory Flow\n(+60 L/min)', xy=(0.5, 65), fontsize=9, ha='center', color='#27ae60')
    ax2.annotate('Expiratory Flow', xy=(2.5, -35), fontsize=9, ha='center', color='#3498db')
    
    ax2.set_ylabel('Flow (L/min)', fontsize=12, fontweight='bold')
    ax2.set_xlim(0, 6)
    ax2.set_ylim(-60, 80)
    ax2.grid(True, alpha=0.3)
    
    # Plot 3: Volume-Time
    ax3 = axes[2]
    ax3.fill_between(t, 0, volume, alpha=0.3, color='#9b59b6')
    ax3.plot(t, volume, color='#8e44ad', linewidth=2)
    ax3.axhline(y=500, color='#9b59b6', linestyle='--', alpha=0.5, label='Tidal Volume (500 mL)')
    
    ax3.annotate('Tidal Volume\n(500 mL)', xy=(1.75, 520), fontsize=10, ha='center', fontweight='bold', color='#8e44ad')
    
    ax3.set_xlabel('Time (seconds)', fontsize=12, fontweight='bold')
    ax3.set_ylabel('Volume (mL)', fontsize=12, fontweight='bold')
    ax3.set_xlim(0, 6)
    ax3.set_ylim(0, 600)
    ax3.grid(True, alpha=0.3)
    ax3.legend(loc='upper right', fontsize=9)
    
    # Add breath cycle annotations
    for ax in axes:
        for i in range(3):
            ax.axvline(x=i*3, color='#bdc3c7', linestyle=':', alpha=0.5)
            ax.axvline(x=i*3+1, color='#bdc3c7', linestyle=':', alpha=0.5)
            ax.axvline(x=i*3+2.5, color='#bdc3c7', linestyle=':', alpha=0.5)
    
    plt.tight_layout()
    save_fig(fig, 'ventilator_waveforms.png')


def create_capnography():
    """8. EtCO2 waveform (capnogram)"""
    fig, ax = plt.subplots(figsize=(14, 10))
    
    # Generate capnogram waveform
    t = np.linspace(0, 12, 800)
    
    etco2 = np.zeros_like(t)
    for i, ti in enumerate(t):
        cycle = ti % 4
        if cycle < 0.1:  # A-B: Baseline (inspiratory)
            etco2[i] = 0
        elif cycle < 0.8:  # B-C: Expiratory upstroke
            etco2[i] = 40 * ((cycle - 0.1) / 0.7) ** 2
        elif cycle < 2.5:  # C-D: Alveolar plateau
            etco2[i] = 40 + 2 * np.sin((cycle - 0.8) * 2)
        elif cycle < 3.0:  # D-E: Inspiratory downstroke
            etco2[i] = 40 * (1 - (cycle - 2.5) / 0.5)
        else:  # Back to baseline
            etco2[i] = 0
    
    # Plot
    ax.fill_between(t, 0, etco2, alpha=0.3, color='#2ecc71')
    ax.plot(t, etco2, color='#27ae60', linewidth=2.5)
    
    # Normal range shading
    ax.axhspan(35, 45, alpha=0.1, color='#27ae60', label='Normal EtCO₂ (35-45 mmHg)')
    
    # Phase labels for one breath
    breath_start = 0
    
    # A-B: Baseline
    ax.annotate('A-B\nBaseline\n(Dead space)', xy=(0.05, 2), xytext=(0.5, 15),
                fontsize=9, ha='center',
                arrowprops=dict(arrowstyle='->', color='#2c3e50'),
                bbox=dict(boxstyle='round', facecolor='#f8f9fa', alpha=0.9))
    
    # B-C: Expiratory upstroke
    ax.annotate('B-C\nExpiratory\nUpstroke', xy=(0.4, 15), xytext=(1.2, 30),
                fontsize=9, ha='center',
                arrowprops=dict(arrowstyle='->', color='#2c3e50'),
                bbox=dict(boxstyle='round', facecolor='#f8f9fa', alpha=0.9))
    
    # C-D: Alveolar plateau
    ax.annotate('C-D\nAlveolar\nPlateau', xy=(1.5, 41), xytext=(2.5, 50),
                fontsize=9, ha='center',
                arrowprops=dict(arrowstyle='->', color='#2c3e50'),
                bbox=dict(boxstyle='round', facecolor='#f8f9fa', alpha=0.9))
    
    # D: End-tidal point
    ax.plot([1.6], [42], 'ro', markersize=10)
    ax.annotate('D\nEtCO₂\n(~40 mmHg)', xy=(1.6, 42), xytext=(3.2, 42),
                fontsize=10, ha='left', fontweight='bold', color='#c0392b',
                arrowprops=dict(arrowstyle='->', color='#c0392b'))
    
    # D-E: Inspiratory downstroke
    ax.annotate('D-E\nInspiratory\nDownstroke', xy=(2.7, 20), xytext=(3.5, 30),
                fontsize=9, ha='center',
                arrowprops=dict(arrowstyle='->', color='#2c3e50'),
                bbox=dict(boxstyle='round', facecolor='#f8f9fa', alpha=0.9))
    
    # Styling
    ax.set_xlabel('Time (seconds)', fontsize=13, fontweight='bold')
    ax.set_ylabel('CO₂ Concentration (mmHg)', fontsize=13, fontweight='bold')
    ax.set_title('Capnography - Normal EtCO₂ Waveform', fontsize=16, fontweight='bold', pad=20)
    ax.set_xlim(0, 12)
    ax.set_ylim(0, 60)
    ax.grid(True, alpha=0.3, linestyle='--')
    ax.legend(loc='upper right', fontsize=10)
    
    # Clinical significance box
    clinical_text = """Clinical Significance:

Normal EtCO₂: 35-45 mmHg

↑ EtCO₂:
• Hypoventilation
• Increased CO₂ production
• Rebreathing

↓ EtCO₂:
• Hyperventilation
• Decreased perfusion
• Airway obstruction
• Esophageal intubation

Waveform Shape:
• Steep upstroke = airway obstruction
• No plateau = bronchospasm
• Sudden drop = disconnection"""
    
    ax.text(0.98, 0.98, clinical_text, transform=ax.transAxes, fontsize=9,
            verticalalignment='top', horizontalalignment='right',
            bbox=dict(boxstyle='round', facecolor='#e8f8f5', edgecolor='#27ae60', alpha=0.95))
    
    save_fig(fig, 'capnography.png')


def create_chest_xray_normal():
    """9. Normal chest X-ray diagram"""
    fig, ax = plt.subplots(figsize=(12, 14))
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.set_aspect('equal')
    ax.axis('off')
    
    ax.text(50, 98, 'Normal Chest X-Ray (Diagram)', fontsize=18, fontweight='bold', 
            ha='center', va='top', color='#2c3e50')
    
    # Thoracic cage outline
    thorax = patches.Ellipse((50, 50), 60, 80, linewidth=3, 
                              edgecolor='#2c3e50', facecolor='#f8f9fa')
    ax.add_patch(thorax)
    
    # Ribs (simplified)
    for i, y in enumerate([75, 70, 65, 60, 55, 50, 45, 40, 35]):
        # Left ribs
        ax.plot([25, 45], [y, y+2], color='#7f8c8d', linewidth=2)
        # Right ribs
        ax.plot([55, 75], [y+2, y], color='#7f8c8d', linewidth=2)
    
    # Clavicles
    ax.plot([30, 45], [82, 78], color='#7f8c8d', linewidth=3)
    ax.plot([55, 70], [78, 82], color='#7f8c8d', linewidth=3)
    
    # Trachea
    ax.plot([48, 48, 52, 52, 48], [85, 72, 72, 85, 85], color='#34495e', linewidth=6, alpha=0.5)
    ax.text(50, 88, 'Trachea', fontsize=10, ha='center', fontweight='bold')
    
    # Carina
    ax.plot([50], [72], marker='v', markersize=6, color='#34495e')
    
    # Left lung field
    left_lung = patches.Ellipse((36, 50), 22, 45, angle=5, linewidth=2, 
                                 edgecolor='#3498db', facecolor='#d6eaf8', alpha=0.5)
    ax.add_patch(left_lung)
    
    # Right lung field
    right_lung = patches.Ellipse((64, 50), 24, 48, angle=-5, linewidth=2, 
                                  edgecolor='#3498db', facecolor='#d6eaf8', alpha=0.5)
    ax.add_patch(right_lung)
    
    # Hila (hilum shadows)
    ax.add_patch(Circle((42, 58), 4, facecolor='#95a5a6', edgecolor='#7f8c8d', alpha=0.6))
    ax.add_patch(Circle((58, 58), 4, facecolor='#95a5a6', edgecolor='#7f8c8d', alpha=0.6))
    
    # Heart shadow
    heart = patches.Ellipse((50, 42), 18, 22, linewidth=2, 
                             edgecolor='#e74c3c', facecolor='#fadbd8', alpha=0.6)
    ax.add_patch(heart)
    ax.text(50, 30, 'Heart', fontsize=11, ha='center', fontweight='bold', color='#c0392b')
    
    # Cardiophrenic angles
    ax.plot([42], [32], marker='o', markersize=4, color='#e74c3c')
    ax.plot([58], [32], marker='o', markersize=4, color='#e74c3c')
    ax.text(38, 28, 'Cardiophrenic\nAngle', fontsize=8, ha='center', color='#c0392b')
    ax.text(62, 28, 'Cardiophrenic\nAngle', fontsize=8, ha='center', color='#c0392b')
    
    # Diaphragm
    diaphragm_x = np.linspace(25, 75, 100)
    left_hemi = 32 + 2 * np.sin((diaphragm_x - 25) * np.pi / 25)
    right_hemi = 35 + 2 * np.sin((diaphragm_x - 50) * np.pi / 25)
    ax.plot(diaphragm_x[:50], left_hemi[:50], color='#8b4513', linewidth=3)
    ax.plot(diaphragm_x[50:], right_hemi[50:], color='#8b4513', linewidth=3)
    ax.text(32, 22, 'Left Hemi-\ndiaphragm', fontsize=9, ha='center', color='#8b4513')
    ax.text(68, 25, 'Right Hemi-\ndiaphragm', fontsize=9, ha='center', color='#8b4513')
    
    # Costophrenic angles
    ax.plot([28], [30], marker='o', markersize=4, color='#27ae60')
    ax.plot([72], [33], marker='o', markersize=4, color='#27ae60')
    ax.text(22, 26, 'Costophrenic\nAngle', fontsize=8, ha='center', color='#27ae60')
    ax.text(78, 29, 'Costophrenic\nAngle', fontsize=8, ha='center', color='#27ae60')
    
    # Labels
    ax.text(25, 55, 'Left\nLung', fontsize=11, ha='center', fontweight='bold', color='#2980b9')
    ax.text(75, 55, 'Right\nLung', fontsize=11, ha='center', fontweight='bold', color='#2980b9')
    ax.text(42, 64, 'Hilum', fontsize=9, ha='center', color='#7f8c8d')
    ax.text(58, 64, 'Hilum', fontsize=9, ha='center', color='#7f8c8d')
    
    # Mediastinum
    ax.text(50, 70, 'Mediastinum', fontsize=9, ha='center', style='italic', color='#8e44ad')
    
    # Legend
    legend_text = """Key Features:
• Clear lung fields
• Sharp costophrenic angles
• Normal heart size
• Visible vascular markings
• No infiltrates or masses"""
    
    ax.text(5, 15, legend_text, fontsize=9, verticalalignment='top',
            bbox=dict(boxstyle='round', facecolor='#f8f9fa', edgecolor='#bdc3c7', alpha=0.9))
    
    save_fig(fig, 'chest_xray_normal.png')


def create_pneumothorax_diagram():
    """10. Pneumothorax diagram"""
    fig, axes = plt.subplots(1, 2, figsize=(14, 10))
    
    # Title
    fig.suptitle('Pneumothorax - Collapsed Lung', fontsize=18, fontweight='bold', y=0.98)
    
    # Normal side (left)
    ax1 = axes[0]
    ax1.set_xlim(0, 10)
    ax1.set_ylim(0, 10)
    ax1.set_aspect('equal')
    ax1.set_title('Normal Lung', fontsize=14, fontweight='bold', color='#27ae60')
    
    # Chest wall
    ax1.add_patch(patches.Rectangle((0.5, 0.5), 4, 9, fill=False, edgecolor='#2c3e50', linewidth=3))
    
    # Normal lung
    lung = patches.Ellipse((3, 5), 3, 7, facecolor='#d6eaf8', edgecolor='#3498db', linewidth=2)
    ax1.add_patch(lung)
    
    # Vascular markings
    for y in [3, 4, 5, 6, 7]:
        ax1.plot([2.2, 3.8], [y, y], color='#2980b9', linewidth=1, alpha=0.5)
    
    # Pleural space (thin line)
    ax1.plot([4.5, 4.5], [1.5, 8.5], color='#7f8c8d', linewidth=1, linestyle='--')
    
    ax1.text(3, 0.2, 'Normal expansion\nVascular markings present', ha='center', fontsize=9, style='italic')
    ax1.text(2.5, 9.2, 'Chest Wall', fontsize=9, ha='center')
    ax1.text(3, 5, 'Lung', fontsize=10, ha='center', fontweight='bold', color='#2980b9')
    ax1.axis('off')
    
    # Pneumothorax side (right)
    ax2 = axes[1]
    ax2.set_xlim(0, 10)
    ax2.set_ylim(0, 10)
    ax2.set_aspect('equal')
    ax2.set_title('Pneumothorax', fontsize=14, fontweight='bold', color='#e74c3c')
    
    # Chest wall
    ax2.add_patch(patches.Rectangle((5.5, 0.5), 4, 9, fill=False, edgecolor='#2c3e50', linewidth=3))
    
    # Collapsed lung (smaller, medial)
    collapsed = patches.Ellipse((6.5, 5), 1.8, 4, facecolor='#fadbd8', edgecolor='#e74c3c', linewidth=2)
    ax2.add_patch(collapsed)
    
    # Vascular markings (only in collapsed lung)
    for y in [4, 5, 6]:
        ax2.plot([6, 7], [y, y], color='#e74c3c', linewidth=1, alpha=0.5)
    
    # Pleural line (visceral pleura)
    ax2.plot([7.5, 7.5], [2, 8], color='#c0392b', linewidth=2, linestyle='--')
    ax2.text(7.5, 8.5, 'Visceral\nPleural Line', fontsize=8, ha='center', color='#c0392b')
    
    # Air in pleural space (no markings)
    ax2.add_patch(patches.Rectangle((7.5, 1.5), 2, 7, facecolor='#fff3cd', 
                                     edgecolor='#f39c12', linewidth=1, alpha=0.3, linestyle='--'))
    
    # Air arrows
    ax2.annotate('', xy=(8.5, 6), xytext=(8.5, 7),
                arrowprops=dict(arrowstyle='->', color='#f39c12', lw=2))
    ax2.annotate('', xy=(8.5, 4), xytext=(8.5, 5),
                arrowprops=dict(arrowstyle='->', color='#f39c12', lw=2))
    ax2.text(8.5, 3, 'Air in\nPleural\nSpace', fontsize=9, ha='center', color='#f39c12', fontweight='bold')
    
    ax2.text(6.5, 0.2, 'Collapsed lung\nNo vascular markings peripherally', ha='center', fontsize=9, style='italic', color='#c0392b')
    ax2.text(7.5, 5, 'Collapsed\nLung', fontsize=9, ha='center', fontweight='bold', color='#c0392b')
    ax2.axis('off')
    
    # Add comparison arrow between panels
    fig.text(0.5, 0.5, '→', fontsize=40, ha='center', va='center', color='#7f8c8d')
    
    plt.tight_layout()
    save_fig(fig, 'pneumothorax_diagram.png')


def create_intubation_diagram():
    """11. Endotracheal tube placement"""
    fig, ax = plt.subplots(figsize=(12, 14))
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.set_aspect('equal')
    ax.axis('off')
    
    ax.text(50, 98, 'Endotracheal Intubation', fontsize=18, fontweight='bold', 
            ha='center', va='top', color='#2c3e50')
    
    # Head outline (sagittal view)
    # Skull
    skull_x = [30, 35, 45, 55, 65, 70, 70, 65, 60, 50, 40, 35, 30]
    skull_y = [90, 95, 97, 97, 95, 90, 80, 70, 65, 62, 65, 70, 80]
    ax.fill(skull_x, skull_y, color='#ffdbac', edgecolor='#8b4513', linewidth=2, alpha=0.8)
    
    # Face profile
    face_x = [30, 25, 25, 30, 35, 40, 45, 50]
    face_y = [80, 75, 65, 55, 50, 48, 50, 55]
    ax.fill(face_x, face_y, color='#ffdbac', edgecolor='#8b4513', linewidth=2, alpha=0.8)
    
    # Oral cavity
    ax.fill([35, 45, 48, 42], [65, 65, 58, 58], color='#e74c3c', alpha=0.3)
    ax.plot([35, 45, 48, 42, 35], [65, 65, 58, 58, 65], color='#c0392b', linewidth=2)
    
    # Tongue
    tongue = patches.Ellipse((40, 60), 12, 6, angle=-10, facecolor='#e74c3c', 
                              edgecolor='#c0392b', alpha=0.6)
    ax.add_patch(tongue)
    
    # Pharynx
    ax.fill([42, 48, 48, 45], [58, 58, 45, 45], color='#e74c3c', alpha=0.3)
    ax.plot([42, 48, 48, 45], [58, 58, 45, 45], color='#c0392b', linewidth=2)
    
    # Larynx
    larynx = patches.Rectangle((43, 38), 8, 10, facecolor='#fadbd8', 
                                edgecolor='#8b4513', linewidth=2)
    ax.add_patch(larynx)
    
    # Epiglottis
    epiglottis_x = [45, 48, 46, 44]
    epiglottis_y = [48, 52, 54, 50]
    ax.fill(epiglottis_x, epiglottis_y, color='#e74c3c', edgecolor='#c0392b', alpha=0.7)
    ax.text(50, 53, 'Epiglottis', fontsize=9, color='#c0392b')
    
    # Vocal cords
    ax.plot([46, 48], [42, 42], color='#8e44ad', linewidth=4)
    ax.text(52, 42, 'Vocal Cords', fontsize=9, color='#8e44ad')
    
    # Trachea
    trachea = patches.Rectangle((44, 18), 6, 20, facecolor='#fadbd8', 
                                 edgecolor='#c0392b', linewidth=2)
    ax.add_patch(trachea)
    # Tracheal rings
    for y in [35, 30, 25, 20]:
        ax.plot([44, 50], [y, y], color='#c0392b', linewidth=1.5)
    ax.text(52, 28, 'Trachea', fontsize=10, color='#c0392b')
    
    # Cricoid cartilage
    ax.add_patch(patches.Rectangle((43, 36), 8, 4, facecolor='#fadbd8', 
                                    edgecolor='#8b4513', linewidth=2))
    ax.text(55, 38, 'Cricoid', fontsize=9, color='#8b4513')
    
    # Endotracheal tube
    # Tube path
    tube_x = [28, 35, 42, 46, 47, 47, 47, 47]
    tube_y = [68, 62, 56, 50, 44, 38, 30, 22]
    ax.plot(tube_x, tube_y, color='#2c3e50', linewidth=6, solid_capstyle='round')
    ax.plot(tube_x, tube_y, color='#95a5a6', linewidth=4, solid_capstyle='round')
    
    # Cuff (inflated)
    cuff = patches.Ellipse((47, 28), 7, 5, facecolor='#3498db', 
                            edgecolor='#2980b9', alpha=0.7)
    ax.add_patch(cuff)
    ax.text(55, 28, 'Inflated\nCuff', fontsize=9, ha='left', color='#2980b9')
    
    # Cuff inflation line
    ax.plot([50, 55], [28, 25], color='#3498db', linewidth=2)
    ax.plot([55, 58], [25, 20], color='#3498db', linewidth=2)
    
    # Tube tip
    ax.plot([47], [22], marker='v', markersize=8, color='#2c3e50')
    ax.text(47, 19, 'Tube Tip\n(2-4 cm above\ncarina)', fontsize=8, ha='center', color='#2c3e50')
    
    # Carina
    ax.plot([47], [20], marker='^', markersize=6, color='#c0392b')
    ax.text(52, 20, 'Carina', fontsize=9, color='#c0392b')
    
    # Depth marking
    ax.annotate('', xy=(47, 36), xytext=(47, 22),
                arrowprops=dict(arrowstyle='<->', color='#27ae60', lw=2))
    ax.text(42, 29, '3-5 cm\nabove carina', fontsize=8, ha='right', color='#27ae60')
    
    # Connector
    ax.add_patch(patches.Rectangle((26, 66), 4, 4, facecolor='#2c3e50', 
                                    edgecolor='#2c3e50'))
    ax.text(28, 72, '15 mm\nConnector', fontsize=8, ha='center')
    
    # Labels
    ax.text(60, 85, 'Oral Route', fontsize=11, fontweight='bold', color='#2c3e50')
    
    # Proper placement indicators
    placement_text = """Proper Placement:
• Tip 3-5 cm above carina
• Cuff below vocal cords
• Bilateral breath sounds
• No gastric sounds
• EtCO₂ detected
• Tube mark at teeth/lips"""
    
    ax.text(75, 50, placement_text, fontsize=9, verticalalignment='center',
            bbox=dict(boxstyle='round', facecolor='#e8f8f5', edgecolor='#27ae60', alpha=0.9))
    
    save_fig(fig, 'intubation_diagram.png')


def create_bvm_diagram():
    """12. Bag-valve-mask ventilation"""
    fig, ax = plt.subplots(figsize=(14, 12))
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.set_aspect('equal')
    ax.axis('off')
    
    ax.text(50, 97, 'Bag-Valve-Mask (BVM) Ventilation', fontsize=18, fontweight='bold', 
            ha='center', va='top', color='#2c3e50')
    ax.text(50, 93, 'Two-Person Technique', fontsize=14, ha='center', style='italic', color='#7f8c8d')
    
    # Patient head (simplified)
    head = patches.Ellipse((30, 45), 25, 20, facecolor='#ffdbac', 
                            edgecolor='#8b4513', linewidth=2)
    ax.add_patch(head)
    ax.text(30, 35, 'Patient', fontsize=11, ha='center', fontweight='bold')
    
    # Face mask
    mask = patches.Ellipse((38, 45), 12, 14, facecolor='#3498db', 
                            edgecolor='#2980b9', linewidth=3, alpha=0.5)
    ax.add_patch(mask)
    ax.text(38, 30, 'Face Mask', fontsize=10, ha='center', color='#2980b9')
    
    # Mask seal indication
    ax.annotate('', xy=(32, 40), xytext=(35, 35),
                arrowprops=dict(arrowstyle='->', color='#27ae60', lw=2))
    ax.text(28, 32, 'Proper\nSeal', fontsize=8, ha='center', color='#27ae60')
    
    # BVM bag
    bag = patches.Ellipse((65, 55), 20, 35, facecolor='#f39c12', 
                           edgecolor='#e67e22', linewidth=3, alpha=0.7)
    ax.add_patch(bag)
    ax.text(65, 75, 'Self-Inflating\nBag', fontsize=11, ha='center', fontweight='bold', color='#d35400')
    
    # Bag compression arrows
    ax.annotate('', xy=(65, 65), xytext=(65, 72),
                arrowprops=dict(arrowstyle='->', color='#c0392b', lw=3))
    ax.annotate('', xy=(65, 45), xytext=(65, 38),
                arrowprops=dict(arrowstyle='->', color='#c0392b', lw=3))
    ax.text(75, 55, 'Squeeze\nto Ventilate', fontsize=9, ha='left', color='#c0392b')
    
    # Connecting tubing
    ax.plot([44, 55], [45, 50], color='#2c3e50', linewidth=6)
    ax.plot([44, 55], [45, 50], color='#95a5a6', linewidth=4)
    
    # Reservoir bag (optional)
    reservoir = patches.Ellipse((75, 65), 8, 12, facecolor='#e8f8f5', 
                                 edgecolor='#27ae60', linewidth=2, linestyle='--', alpha=0.5)
    ax.add_patch(reservoir)
    ax.text(82, 65, 'O₂ Reservoir\n(optional)', fontsize=8, ha='left', color='#27ae60')
    
    # O2 tubing
    ax.plot([75, 75], [58, 50], color='#27ae60', linewidth=2, linestyle='--')
    
    # Person 1 - holding mask (EC clamp)
    ax.annotate('', xy=(50, 45), xytext=(60, 25),
                arrowprops=dict(arrowstyle='->', color='#8e44ad', lw=2))
    ax.text(62, 22, 'Person 1:\nEC Clamp\n(Mask Seal)', fontsize=9, ha='left', color='#8e44ad', fontweight='bold')
    
    # EC clamp illustration
    ax.plot([42, 45, 48], [42, 45, 42], color='#8e44ad', linewidth=3)
    ax.text(45, 38, 'E-C\nClamp', fontsize=8, ha='center', color='#8e44ad')
    
    # Person 2 - squeezing bag
    ax.annotate('', xy=(70, 55), xytext=(85, 35),
                arrowprops=dict(arrowstyle='->', color='#8e44ad', lw=2))
    ax.text(87, 30, 'Person 2:\nSqueeze Bag\n(Watch Chest Rise)', fontsize=9, ha='left', color='#8e44ad', fontweight='bold')
    
    # Jaw thrust indication
    ax.annotate('', xy=(25, 48), xytext=(20, 55),
                arrowprops=dict(arrowstyle='->', color='#e74c3c', lw=2))
    ax.text(15, 58, 'Jaw Thrust\n(if no C-spine\ninjury)', fontsize=8, ha='center', color='#e74c3c')
    
    # Head tilt
    ax.annotate('', xy=(22, 42), xytext=(15, 38),
                arrowprops=dict(arrowstyle='->', color='#e74c3c', lw=2))
    ax.text(10, 35, 'Head Tilt\nChin Lift', fontsize=8, ha='center', color='#e74c3c')
    
    # Key points box
    key_points = """Key Points:
• Two-person technique preferred
• EC clamp for mask seal
• Watch for chest rise
• Rate: 10-12 breaths/min
• Deliver over 1 second
• Avoid hyperventilation
• Use 100% O₂ if available"""
    
    ax.text(75, 15, key_points, fontsize=9, verticalalignment='bottom',
            bbox=dict(boxstyle='round', facecolor='#fff3cd', edgecolor='#f39c12', alpha=0.9))
    
    save_fig(fig, 'bvm_diagram.png')


def create_pulse_oximeter():
    """13. Pulse oximeter"""
    fig, ax = plt.subplots(figsize=(12, 10))
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.set_aspect('equal')
    ax.axis('off')
    
    ax.text(50, 97, 'Pulse Oximeter (SpO₂)', fontsize=18, fontweight='bold', 
            ha='center', va='top', color='#2c3e50')
    
    # Finger
    finger = patches.Rectangle((35, 40), 30, 25, facecolor='#ffdbac', 
                                edgecolor='#8b4513', linewidth=2)
    ax.add_patch(finger)
    
    # Fingernail
    nail = patches.Ellipse((50, 52), 12, 15, facecolor='#fadbd8', 
                            edgecolor='#d4a574', linewidth=1)
    ax.add_patch(nail)
    
    # Finger tip
    tip = patches.Ellipse((65, 52.5), 8, 26, facecolor='#ffdbac', 
                           edgecolor='#8b4513', linewidth=2)
    ax.add_patch(tip)
    
    # Pulse oximeter probe (clip style)
    probe_top = patches.Rectangle((38, 58), 24, 12, facecolor='#2c3e50', 
                                   edgecolor='#2c3e50', linewidth=2)
    ax.add_patch(probe_top)
    
    probe_bottom = patches.Rectangle((38, 35), 24, 8, facecolor='#2c3e50', 
                                      edgecolor='#2c3e50', linewidth=2)
    ax.add_patch(probe_bottom)
    
    # Hinge
    ax.add_patch(Circle((50, 56), 3, facecolor='#7f8c8d', edgecolor='#2c3e50'))
    
    # LED emitters (red and infrared)
    ax.add_patch(Circle((45, 62), 2, facecolor='#e74c3c', edgecolor='#c0392b'))
    ax.add_patch(Circle((55, 62), 2, facecolor='#8e44ad', edgecolor='#6c3483'))
    ax.text(45, 66, 'Red', fontsize=7, ha='center', color='#e74c3c')
    ax.text(55, 66, 'IR', fontsize=7, ha='center', color='#8e44ad')
    
    # Photodetector
    ax.add_patch(Circle((50, 39), 3, facecolor='#f1c40f', edgecolor='#f39c12'))
    ax.text(50, 33, 'Detector', fontsize=8, ha='center', color='#f39c12')
    
    # Light path arrows
    ax.annotate('', xy=(50, 42), xytext=(45, 60),
                arrowprops=dict(arrowstyle='->', color='#e74c3c', lw=2, linestyle='--'))
    ax.annotate('', xy=(50, 42), xytext=(55, 60),
                arrowprops=dict(arrowstyle='->', color='#8e44ad', lw=2, linestyle='--'))
    
    # Cable
    ax.plot([50, 50], [70, 85], color='#2c3e50', linewidth=4)
    ax.plot([50, 50], [70, 85], color='#95a5a6', linewidth=2)
    
    # Monitor/display
    monitor = patches.Rectangle((35, 75), 30, 18, facecolor='#2c3e50', 
                                 edgecolor='#2c3e50', linewidth=3)
    ax.add_patch(monitor)
    
    # Screen
    screen = patches.Rectangle((38, 78), 24, 12, facecolor='#27ae60', 
                                edgecolor='#1e8449', linewidth=1)
    ax.add_patch(screen)
    
    # SpO2 reading
    ax.text(50, 86, '98%', fontsize=24, ha='center', fontweight='bold', color='#ffffff')
    ax.text(50, 81, 'SpO₂', fontsize=10, ha='center', color='#d5f5e3')
    
    # Pulse bar
    ax.plot([40, 60], [79, 79], color='#1e8449', linewidth=4)
    pulse_wave = [40, 42, 44, 45, 46, 47, 48, 50, 52, 54, 55, 56, 57, 58, 60]
    pulse_amp = [79, 79.5, 79, 78.5, 79, 79.3, 79, 79, 79, 79.5, 79, 78.5, 79, 79.2, 79]
    ax.plot(pulse_wave, pulse_amp, color='#2ecc71', linewidth=2)
    
    # Pulse rate
    ax.text(62, 84, '72', fontsize=14, ha='left', fontweight='bold', color='#e74c3c')
    ax.text(72, 84, 'bpm', fontsize=9, ha='left', color='#e74c3c')
    
    # Plethysmograph waveform
    t_wave = np.linspace(35, 65, 100)
    y_base = 20
    pleth = y_base + 3 * np.sin((t_wave - 35) * 2 * np.pi / 15) * np.exp(-((t_wave - 50) % 15) / 5)
    ax.plot(t_wave, pleth, color='#e74c3c', linewidth=2)
    ax.fill_between(t_wave, y_base, pleth, alpha=0.3, color='#e74c3c')
    ax.text(50, 16, 'Plethysmograph Waveform', fontsize=10, ha='center', color='#e74c3c')
    
    # Labels
    ax.text(25, 52, 'Finger\nProbe', fontsize=10, ha='center', color='#2c3e50')
    ax.text(75, 84, 'Monitor', fontsize=10, ha='center', color='#2c3e50')
    
    # Principle explanation
    principle = """Principle:
• Red (660nm) & Infrared (940nm) light
• Oxyhemoglobin absorbs more IR
• Deoxyhemoglobin absorbs more Red
• Ratio calculates SpO₂
• Plethysmograph shows pulse"""
    
    ax.text(75, 50, principle, fontsize=9, verticalalignment='center',
            bbox=dict(boxstyle='round', facecolor='#d5f5e3', edgecolor='#27ae60', alpha=0.9))
    
    # Normal values
    values = """Normal Values:
• Normal: 95-100%
• Mild hypoxemia: 90-94%
• Moderate: 85-89%
• Severe: <85%

Note: SpO₂ < 90% ≈
PaO₂ < 60 mmHg"""
    
    ax.text(20, 20, values, fontsize=9, verticalalignment='center',
            bbox=dict(boxstyle='round', facecolor='#e8f8f5', edgecolor='#1abc9c', alpha=0.9))
    
    save_fig(fig, 'pulse_oximeter.png')


def create_stethoscope_placement():
    """14. Auscultation points"""
    fig, ax = plt.subplots(figsize=(12, 14))
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.set_aspect('equal')
    ax.axis('off')
    
    ax.text(50, 98, 'Stethoscope Auscultation Points', fontsize=18, fontweight='bold', 
            ha='center', va='top', color='#2c3e50')
    
    # Torso outline
    torso = patches.Ellipse((50, 50), 50, 70, facecolor='#ffdbac', 
                             edgecolor='#8b4513', linewidth=2, alpha=0.3)
    ax.add_patch(torso)
    
    # Clavicles
    ax.plot([30, 45], [82, 78], color='#8b4513', linewidth=3)
    ax.plot([55, 70], [78, 82], color='#8b4513', linewidth=3)
    
    # Sternum line
    ax.plot([50, 50], [75, 25], color='#e74c3c', linewidth=1, linestyle='--', alpha=0.5)
    ax.text(52, 75, 'Sternum', fontsize=9, color='#e74c3c')
    
    # Auscultation points (anterior)
    # Right upper (anterior) - 1R
    ax.add_patch(Circle((58, 72), 2.5, facecolor='#3498db', edgecolor='#2980b9', linewidth=2))
    ax.text(58, 72, '1', fontsize=12, ha='center', va='center', fontweight='bold', color='white')
    ax.text(63, 72, 'R Upper', fontsize=9, color='#2980b9')
    
    # Left upper (anterior) - 1L
    ax.add_patch(Circle((42, 72), 2.5, facecolor='#3498db', edgecolor='#2980b9', linewidth=2))
    ax.text(42, 72, '1', fontsize=12, ha='center', va='center', fontweight='bold', color='white')
    ax.text(32, 72, 'L Upper', fontsize=9, ha='right', color='#2980b9')
    
    # Right middle - 2R
    ax.add_patch(Circle((60, 58), 2.5, facecolor='#27ae60', edgecolor='#1e8449', linewidth=2))
    ax.text(60, 58, '2', fontsize=12, ha='center', va='center', fontweight='bold', color='white')
    ax.text(65, 58, 'R Middle', fontsize=9, color='#1e8449')
    
    # Left middle (lingula) - 2L
    ax.add_patch(Circle((40, 58), 2.5, facecolor='#27ae60', edgecolor='#1e8449', linewidth=2))
    ax.text(40, 58, '2', fontsize=12, ha='center', va='center', fontweight='bold', color='white')
    ax.text(30, 58, 'L Middle\n(Lingula)', fontsize=9, ha='right', color='#1e8449')
    
    # Right lower - 3R
    ax.add_patch(Circle((62, 42), 2.5, facecolor='#9b59b6', edgecolor='#8e44ad', linewidth=2))
    ax.text(62, 42, '3', fontsize=12, ha='center', va='center', fontweight='bold', color='white')
    ax.text(67, 42, 'R Lower', fontsize=9, color='#8e44ad')
    
    # Left lower - 3L
    ax.add_patch(Circle((38, 42), 2.5, facecolor='#9b59b6', edgecolor='#8e44ad', linewidth=2))
    ax.text(38, 42, '3', fontsize=12, ha='center', va='center', fontweight='bold', color='white')
    ax.text(28, 42, 'L Lower', fontsize=9, ha='right', color='#8e44ad')
    
    # Posterior points (shown on sides)
    # Right posterior upper
    ax.add_patch(Circle((72, 65), 2.5, facecolor='#e67e22', edgecolor='#d35400', linewidth=2))
    ax.text(72, 65, '4', fontsize=12, ha='center', va='center', fontweight='bold', color='white')
    ax.text(78, 65, 'R Post\nUpper', fontsize=9, color='#d35400')
    
    # Left posterior upper
    ax.add_patch(Circle((28, 65), 2.5, facecolor='#e67e22', edgecolor='#d35400', linewidth=2))
    ax.text(28, 65, '4', fontsize=12, ha='center', va='center', fontweight='bold', color='white')
    ax.text(18, 65, 'L Post\nUpper', fontsize=9, ha='right', color='#d35400')
    
    # Right posterior lower
    ax.add_patch(Circle((74, 45), 2.5, facecolor='#e74c3c', edgecolor='#c0392b', linewidth=2))
    ax.text(74, 45, '5', fontsize=12, ha='center', va='center', fontweight='bold', color='white')
    ax.text(80, 45, 'R Post\nLower', fontsize=9, color='#c0392b')
    
    # Left posterior lower
    ax.add_patch(Circle((26, 45), 2.5, facecolor='#e74c3c', edgecolor='#c0392b', linewidth=2))
    ax.text(26, 45, '5', fontsize=12, ha='center', va='center', fontweight='bold', color='white')
    ax.text(16, 45, 'L Post\nLower', fontsize=9, ha='right', color='#c0392b')
    
    # Lung zones indication
    ax.add_patch(patches.Rectangle((35, 78), 12, 3, facecolor='#3498db', alpha=0.3))
    ax.text(41, 79.5, 'Upper Lobes', fontsize=8, ha='center', color='#2980b9')
    
    ax.add_patch(patches.Rectangle((35, 52), 12, 3, facecolor='#27ae60', alpha=0.3))
    ax.text(41, 53.5, 'Middle/Lingula', fontsize=8, ha='center', color='#1e8449')
    
    ax.add_patch(patches.Rectangle((33, 35), 16, 3, facecolor='#9b59b6', alpha=0.3))
    ax.text(41, 36.5, 'Lower Lobes', fontsize=8, ha='center', color='#8e44ad')
    
    # Legend
    legend = """Anterior Sites:
1. 2nd ICS, mid-clavicular
2. 4th ICS, mid-clavicular  
3. 6th ICS, mid-clavicular

Posterior Sites:
4. Between scapulae
5. 8-10th ICS, below scapulae

Compare bilaterally at
each level"""
    
    ax.text(50, 18, legend, fontsize=10, ha='center', verticalalignment='top',
            bbox=dict(boxstyle='round', facecolor='#f8f9fa', edgecolor='#bdc3c7', alpha=0.9))
    
    # Stethoscope icon
    ax.text(85, 25, '🩺', fontsize=30, ha='center')
    ax.text(85, 20, 'Diaphragm for\nbreath sounds', fontsize=8, ha='center', style='italic')
    
    save_fig(fig, 'stethoscope_placement.png')


# Main execution
if __name__ == '__main__':
    print("Creating respiratory education diagrams...")
    print(f"Output directory: {OUTPUT_DIR}")
    print()
    
    create_respiratory_system()
    create_lungs_diagram()
    create_alveolus_detail()
    create_lung_volumes()
    create_copd_comparison()
    create_oxyhemoglobin_curve()
    create_ventilator_waveforms()
    create_capnography()
    create_chest_xray_normal()
    create_pneumothorax_diagram()
    create_intubation_diagram()
    create_bvm_diagram()
    create_pulse_oximeter()
    create_stethoscope_placement()
    
    print()
    print("All diagrams created successfully!")
    print(f"Files saved to: {OUTPUT_DIR}")
