import express from 'express';
import cors from 'cors'; 
import pokemon from './schema/pokemon.js';
import './connect.js';

const app = express();

app.use(cors()); 
app.use('/assets', express.static('assets'));
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

// --- GET : Liste + Recherche + Pagination ---
app.get('/pokemons', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;
    const searchTerm = req.query.name;
    
    let filter = {};
    if (searchTerm) {
        filter = { "name.french": { $regex: searchTerm, $options: 'i' } };
    }

    const pokemons = await pokemon.find(filter).skip(skip).limit(limit);
    const total = await pokemon.countDocuments(filter);

    res.json({
        page: page,
        totalPages: Math.ceil(total / limit),
        data: pokemons
    });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// --- GET : Un seul pokemon ---
app.get('/pokemons/:id', async (req, res) => {
  try {
    const poke = await pokemon.findOne({ id: parseInt(req.params.id) });
    poke ? res.json(poke) : res.status(404).json({ error: 'Non trouvé' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// --- POST : Créer ---
app.post('/pokemons', async (req, res) => {
    try {
        const newPoke = new pokemon(req.body);
        await newPoke.save();
        res.status(201).json(newPoke);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// --- PUT : Modifier ---
app.put('/pokemons/:id', async (req, res) => {
    try {
        const updated = await pokemon.findOneAndUpdate({ id: parseInt(req.params.id) }, req.body, { new: true });
        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: 'Erreur' });
    }
});

// --- DELETE : Supprimer ---
app.delete('/pokemons/:id', async (req, res) => {
    try {
        await pokemon.findOneAndDelete({ id: parseInt(req.params.id) });
        res.json({ message: 'Supprimé' });
    } catch (error) {
        res.status(500).json({ error: 'Erreur' });
    }
});

app.listen(3000, () => console.log('Serveur : http://localhost:3000'));