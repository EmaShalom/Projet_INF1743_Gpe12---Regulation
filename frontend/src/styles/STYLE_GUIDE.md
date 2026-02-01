# Guide de Style - UQO-Requests

## Introduction
Ce document définit les standards de design et de code pour l'interface utilisateur de l'application UQO-Requests.

---

## Palette de Couleurs

### Couleurs Principales
- **Primary** : `#667eea` (Bleu violet)
- **Secondary** : `#764ba2` (Violet)

### Couleurs de Statut
- **Success** : `#28a745` (Vert)
- **Warning** : `#ffc107` (Jaune/Orange)
- **Danger** : `#dc3545` (Rouge)
- **Info** : `#17a2b8` (Bleu cyan)

### Statuts de Demandes
- **SUBMITTED** : `#ffc107` 🟡
- **IN_PROGRESS** : `#17a2b8` 🔵
- **RESOLVED** : `#28a745` 🟢
- **CLOSED** : `#6c757d` ⚫

---

## Typographie

### Police
- **Famille** : System font stack (-apple-system, BlinkMacSystemFont, Segoe UI, Roboto...)
- **Tailles** : xs (12px), sm (13px), base (15px), lg (16px), xl (18px), 2xl (20px), 3xl (24px), 4xl (32px)
- **Poids** : Normal (400), Medium (500), Semibold (600), Bold (700)

---

## Espacements

Toujours utiliser les variables CSS :
- xs: 4px | sm: 8px | md: 16px | lg: 24px | xl: 32px | xxl: 48px

---

## Responsive Breakpoints

- **Mobile** : < 768px
- **Tablet** : 768px - 1023px
- **Desktop** : >= 1024px

### Approche Mobile-First
```css
/* Mobile (par défaut) */
.element {
  flex-direction: column;
}

/* Tablet et plus */
@media (min-width: 768px) {
  .element {
    flex-direction: row;
  }
}
```

---

## Composants Standard

- **Boutons** : Toujours utiliser `<Button>` (variantes : primary, secondary, danger, success)
- **Formulaires** : Utiliser `<Input>` et `<Select>` avec labels obligatoires
- **Cartes** : Utiliser `<Card>` (border-radius: md, ombre: sm par défaut)

---

## Bonnes Pratiques

### CSS
1. Utiliser les variables CSS (`var(--color-primary)`)
2. Éviter les valeurs en dur (hardcoded)
3. Préférer flexbox à float
4. Mobile-first pour le responsive

### Accessibilité
1. Labels obligatoires sur les formulaires
2. Ratio de contraste minimum 4.5:1
3. Focus visible sur tous les éléments interactifs
4. Navigation au clavier (Tab)

---

## Checklist Responsive

- [ ] Testé sur mobile (< 768px)
- [ ] Testé sur tablet (768px - 1023px)
- [ ] Testé sur desktop (>= 1024px)
- [ ] Pas de débordement horizontal
- [ ] Boutons suffisamment grands pour le touch (44x44px min)
- [ ] Texte lisible sans zoom

---

## Ressources

- Variables CSS : `/src/styles/variables.css`
- Styles globaux : `/src/styles/global.css`
- Composants : `/src/components/`