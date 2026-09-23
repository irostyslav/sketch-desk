const CARDS = [
  {
    id: "lines-land",
    technique: "lines",
    title: "Lines that land",
    minutesDefault: 5,
    minutesPresets: [3, 5, 10, 15],
    guide: "warmup-lines",
    coach: "Swing from the shoulder and lay each line down once.",
    context: {
      history: "A line was a path before it was a style. Draughtsmen trained the arm so the hand would not stop to negotiate the stroke.",
      artists: ["Leonardo da Vinci", "Jean-Auguste-Dominique Ingres"],
      world: "Warm-ups, construction lines, and the first marks under a figure."
    }
  },
  {
    id: "curves",
    technique: "lines",
    title: "Curves",
    minutesDefault: 5,
    minutesPresets: [3, 5, 10, 15],
    guide: "warmup-curves",
    coach: "Draw each arc as one comma. Do not repair it halfway.",
    context: {
      history: "A curve that changes its mind becomes a staircase. Older manuals called the cure a swing of the arm, not a tighter grip.",
      artists: ["Leonardo da Vinci", "Hokusai"],
      world: "Ribbons, leaves, and any edge that has to turn without breaking."
    }
  },
  {
    id: "value-bands",
    technique: "hatching",
    title: "Value bands",
    minutesDefault: 5,
    minutesPresets: [3, 5, 10, 15],
    guide: "value-bands",
    coach: "Change the gaps, not the pressure.",
    context: {
      history: "Tone in ink is how much paper you leave. Engravers built darkness from parallel lines long before a pencil had a full range of grays.",
      artists: ["Albrecht Dürer", "Rembrandt"],
      world: "Engravings, woodcut, and the flat shadow in comics."
    }
  },
  {
    id: "cross-hatch-bands",
    technique: "hatching",
    title: "Cross-hatch density",
    minutesDefault: 5,
    minutesPresets: [3, 5, 10, 15],
    guide: "cross-hatch",
    coach: "Cross the first lines. Pack the second set only where the form turns.",
    context: {
      history: "A second direction of lines darkens a passage without a second tool. The crossing is the shadow, not a texture added for its own sake.",
      artists: ["Albrecht Dürer", "Rembrandt"],
      world: "Etching, engraving, and the heavier shadows in ink comics."
    }
  }
];
