// deck-energy.js
window.DECKS.push({
  id: "energy",
  title: "Energy Memory Match",
  subtitle: "Match energy key words, stores, pathways, and equations.",
  footerNote: "Deck: KS3 Energy",
  modeSizes: {
    easy_quick: 10,
    easy_full: null,   // all pairs
    quick: 10,
    standard: 16,
    full: null
  },
  pairs: [
    // Key words
    ["Conduction", "Transfer of energy through a material by particles colliding when they vibrate."],
    ["Convection", "Transfer of energy through a fluid by particles colliding with each other."],
    ["Radiation", "Transfer of energy as waves."],
    ["Dissipation", "Transfer of energy from a system to the surroundings (often described as wasted energy)."],
    ["Energy pathway", "A way in which energy is transferred from one store to another."],
    ["Energy transfer", "The movement of energy from one store to another."],
    ["Energy store", "A way energy is stored in/by objects due to motion, position, shape or processes."],
    ["Energy resource", "A system that can store large amounts of energy and can often generate electricity."],
    ["Insulator", "A material that does not allow energy to transfer through it easily."],
    ["System", "A group of objects."],
    ["Temperature", "Measurement of the average kinetic energy of particles in a substance (°C)."],

    // Energy stores
    ["Chemical store", "Energy stored in the bonds of a substance (e.g. battery, food, muscles)."],
    ["Kinetic store", "Energy stored in a moving object."],
    ["Elastic potential store", "Energy stored when an object is stretched or compressed."],
    ["Thermal store", "Total energy of particles in an object; more thermal energy = higher temperature."],
    ["Gravitational potential store", "Energy stored when an object is lifted in a gravitational field."],
    ["Nuclear store", "Energy stored in the nucleus of an atom."],
    ["Magnetic store", "Energy stored when repelling poles are pushed closer or attracting poles pulled further apart."],
    ["Electrostatic store", "Energy stored when repelling charges pushed closer or attracting charges pulled further apart."],

    // Pathways
    ["Heating via particle movement", "Energy transferred by conduction or convection due to a temperature difference."],
    ["Heating via radiation", "Energy transferred by waves."],
    ["Work done electrically", "Energy transferred by a current when charges move due to a potential difference."],
    ["Work done mechanically", "Energy transferred by a force making something move through a distance."],

    // Principles + equations
    ["Conservation of energy", "Total energy is conserved: it can be stored or transferred, not created or destroyed."],
    ["Power", "Rate at which energy is transferred; measured in watts (W)."],
    ["Power equation", "power (W) = energy transferred (J) ÷ time (s)"],
    ["Work done", "Energy transferred by a force; measured in joules (J)."],
    ["Work done equation", "work done (J) = force (N) × distance (m)"],

    // Energy resources (from the table)
    ["Renewable resource", "Can be replenished and will not run out."],
    ["Non-renewable resource", "Cannot be replenished in a lifetime and will eventually run out."],

    ["Biofuels advantage", "CO₂ released is balanced by CO₂ taken in during growth (in theory); crops can be grown to meet demand."],
    ["Biofuels disadvantage", "Deforestation may clear land; supply may be affected by poor growing season."],

    ["Fossil fuels advantage", "Output not affected by time of day or weather conditions."],
    ["Fossil fuels disadvantage", "Releases CO₂ (global warming), releases sulfur dioxide (acid rain), habitats destroyed by mining."],

    ["Solar advantage", "No greenhouse gases once built; can be used in remote locations."],
    ["Solar disadvantage", "Unreliable in cloudy areas and doesn’t work at night; many panels needed (habitat damage)."],

    ["Wind advantage", "No greenhouse gases once built."],
    ["Wind disadvantage", "No electricity when little/no wind; locals may dislike sight/noise; habitats disturbed."]
  ]
});
