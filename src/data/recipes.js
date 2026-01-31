
import divineImg from '../assets/images/divine.png';
import gardenImg from '../assets/images/garden.png';

export const recipes = [
    {
        id: 1,
        title: "Golden Cinnamon Latte",
        category: "Beverages",
        image: divineImg,
        time: "5 mins",
        desc: "A warm, soul-soothing elixir infused with Ambrosia Divine Essence.",
        ingredients: [
            "1 tsp Ambrosia Divine Essence (Ground Cinnamon)",
            "1 cup Milk of choice (Oat or Dairy fits best)",
            "1 tsp Wild Honey or Maple Syrup",
            "A pinch of Turmeric (optional)"
        ],
        instructions: [
            "Warm the milk in a small saucepan over medium heat until steaming.",
            "Whisk in the Ambrosia Cinnamon and sweetener until frothy.",
            "Pour into your favorite mug and dust with a final pinch of gold."
        ]
    },
    {
        id: 2,
        title: "Ceylon Heritage Chai",
        category: "Beverages",
        image: gardenImg,
        time: "15 mins",
        desc: "A spiced tea tradition using whole Kuveni sticks.",
        ingredients: [
            "2 Kuveni Cinnamon Sticks",
            "2 bags of Strong Black Tea",
            "3 Cardamom pods, crushed",
            "1 slice of fresh Ginger",
            "2 cups Water",
            "Milk and Sugar to taste"
        ],
        instructions: [
            "Boil water with cinnamon sticks, cardamom, and ginger for 5 minutes.",
            "Add tea bags and steep for another 3-4 minutes.",
            "Remove tea bags and spices, add milk and sugar, and bring to a simmer.",
            "Strain into cups and enjoy the aroma of Ceylon."
        ]
    },
    {
        id: 3,
        title: "Cinnamon Glazed Apple Tart",
        category: "Desserts",
        image: divineImg,
        time: "45 mins",
        desc: "A classic dessert elevated by the floral notes of Ceylon cinnamon.",
        ingredients: [
            "1 sheet Puff Pastry",
            "3 large Apples, thinly sliced",
            "2 tbsp Melted Butter",
            "3 tbsp Brown Sugar",
            "1 tbsp Ambrosia Cinnamon"
        ],
        instructions: [
            "Preheat oven to 200°C (400°F).",
            "Layer apple slices over the puff pastry sheet.",
            "Mix cinnamon and sugar, then sprinkle over the apples.",
            "Brush with melted butter and bake for 20-25 minutes until golden."
        ]
    },
    {
        id: 4,
        title: "Health Benefits: Wellness Water",
        category: "Wellness",
        image: gardenImg,
        time: "4 min read",
        desc: "How a pinch of Ambrosia every morning can change your metabolism.",
        ingredients: [
            "1 Kuveni Cinnamon Stick",
            "1 liter Filtered Water",
            "Optional: Lemon slice or Mint leaves"
        ],
        instructions: [
            "Place the cinnamon stick in a glass pitcher of water.",
            "Let it infuse overnight in the refrigerator.",
            "Drink throughout the day to help regulate blood sugar and boost metabolism."
        ]
    }
];
