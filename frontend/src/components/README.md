# Composants Réutilisables

Cette documentation présente les composants UI réutilisables disponibles dans l'application.

## Button

Bouton stylisé avec différentes variantes.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'primary' \| 'secondary' \| 'danger' \| 'success'` | `'primary'` | Style du bouton |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Taille du bouton |
| `disabled` | `boolean` | `false` | Désactive le bouton |
| `loading` | `boolean` | `false` | Affiche un spinner |
| `onClick` | `function` | - | Fonction appelée au clic |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | Type HTML |

### Exemples
```jsx
import Button from './components/Button';

// Bouton primaire
<Button onClick={() => alert('Clic')}>Cliquer ici</Button>

// Bouton danger
<Button variant="danger">Supprimer</Button>

// Bouton avec chargement
<Button loading={true}>Chargement...</Button>

// Bouton de soumission
<Button type="submit" variant="success">Soumettre</Button>
```

---

## Input

Champ de saisie avec label et gestion d'erreurs.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `type` | `string` | `'text'` | Type d'input HTML |
| `label` | `string` | - | Label du champ |
| `name` | `string` | **requis** | Nom du champ |
| `value` | `string` | **requis** | Valeur du champ |
| `onChange` | `function` | **requis** | Fonction de changement |
| `error` | `string` | - | Message d'erreur |
| `placeholder` | `string` | - | Placeholder |
| `required` | `boolean` | `false` | Champ requis |
| `disabled` | `boolean` | `false` | Champ désactivé |
| `helpText` | `string` | - | Texte d'aide |

### Exemples
```jsx
import Input from './components/Input';

<Input
  label="Adresse email"
  name="email"
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error={emailError}
  required
  placeholder="vous@example.com"
/>
```

---

## Select

Menu déroulant avec label et gestion d'erreurs.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | - | Label du champ |
| `name` | `string` | **requis** | Nom du champ |
| `value` | `string` | **requis** | Valeur sélectionnée |
| `onChange` | `function` | **requis** | Fonction de changement |
| `options` | `array` | **requis** | Liste des options |
| `error` | `string` | - | Message d'erreur |
| `required` | `boolean` | `false` | Champ requis |
| `disabled` | `boolean` | `false` | Champ désactivé |

### Format des options
```javascript
const options = [
  { value: '', label: 'Sélectionnez...' },
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' }
];
```

### Exemples
```jsx
import Select from './components/Select';

<Select
  label="Type de demande"
  name="type"
  value={type}
  onChange={(e) => setType(e.target.value)}
  options={[
    { value: '', label: 'Sélectionnez...' },
    { value: 'technique', label: 'Technique' },
    { value: 'bug', label: 'Bug' }
  ]}
  error={typeError}
  required
/>
```

---

## Card

Carte conteneur stylisée.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `node` | **requis** | Contenu de la carte |
| `title` | `string` | - | Titre de la carte |
| `className` | `string` | `''` | Classes CSS additionnelles |
| `onClick` | `function` | - | Rend la carte cliquable |

### Exemples
```jsx
import Card from './components/Card';

// Carte simple
<Card title="Mon Titre">Contenu de la carte</Card>

// Carte cliquable
<Card onClick={() => navigate('/detail')}>
  Cliquez pour voir le détail
</Card>
```

---

## Badge

Composant Badge déjà existant pour les statuts (voir Badge.jsx).
