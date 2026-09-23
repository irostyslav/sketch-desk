const PATHS = [
  { id: "foundations", title: "Foundations", blurb: "Train the hand before the subject." },
  { id: "trees", title: "Trees", blurb: "Structure, masses, value — then a page of them." },
  { id: "architecture", title: "Street & facade", blurb: "Shop houses, windows, and streets that recede." },
];

const LESSONS = [
  {
    id: "lines",
    path: "foundations",
    title: "Lines that land",
    level: "Start here",
    minutes: 6,
    blurb: "Draw from the shoulder. One confident stroke beats ten scratchy ones.",
    steps: [
      { title: "Ghost the stroke", coach: "Hover the pen over the faint guides and rehearse the motion in the air twice. Then put the line down in one pass.", hint: "Look at the end point, not the nib.", guide: "warmup-lines" },
      { title: "Curves without steering", coach: "Same idea, now with arcs. Keep the wrist quiet. The curve should feel like a comma, not a staircase.", hint: "If it wobbles, slow down — don’t add extra strokes.", guide: "warmup-curves" },
      { title: "Ellipses in a tube", coach: "Ellipses are just circles seen in perspective. Draw through the box as if the ellipse continues behind the paper.", hint: "The far side of the ellipse is thinner.", guide: "warmup-ellipses" }
    ]
  },
  {
    id: "hatching",
    path: "foundations",
    title: "Hatching & value",
    level: "Start here",
    minutes: 8,
    blurb: "Trees and facades only work if your darks are dark. Practice bands of tone.",
    steps: [
      { title: "Four value bands", coach: "Fill each band with parallel hatching. Leave paper white in band 1. Pack the lines tighter as you move right.", hint: "Change spacing, not pressure, to get darker.", guide: "value-bands" },
      { title: "Form on a cylinder", coach: "Hatch around the form, not straight down the page. Darkest on the side opposite the sun, with a sliver of reflected light on the edge.", hint: "Sun is coming from the upper left.", guide: "value-cylinder" }
    ]
  },
  {
    id: "vessels",
    path: "foundations",
    title: "Mug & bottle",
    level: "Foundations · form",
    minutes: 10,
    blurb: "Two cylinders on a table. The whole lesson is ellipses: lip, belly, base.",
    steps: [
      { title: "Ellipses first", coach: "Draw the top and bottom ellipses before any sides. A mug and a bottle share the same idea: a circle tipped away from you.", hint: "Bottoms are rounder than lips only if the form is closer. Keep both calm.", guide: "vessel-ellipses" },
      { title: "Sides, handle, neck", coach: "Connect the ellipses with straight-enough sides. The mug handle is another ellipse seen sideways. The bottle shoulder is a curve that tightens into the neck.", hint: "Don’t draw the handle as a C stuck on the outside. It grows from the body.", guide: "vessel-profiles" },
      { title: "One light, one shadow", coach: "Sun from the upper left. Hatch the right side of each form, darker where the mug overlaps the bottle’s shadow. A cast shadow sits on the table, not under the object like a sticker.", hint: "Leave a thin light along the left edge. That is the highlight, not a second outline.", guide: "vessel-value" }
    ]
  },
  {
    id: "tree-skeleton",
    path: "trees",
    title: "Tree skeleton",
    level: "Trees · 1",
    minutes: 8,
    blurb: "Level 1 of the public tree method: trunk and branches only. No leaves yet.",
    steps: [
      { title: "Plant the trunk", coach: "Two slightly bowed lines that flare at the ground and taper as they rise. Trees are not telephone poles.", hint: "Leave a gap of air at the base so it can sit on soil later.", guide: "tree-trunk" },
      { title: "Primary branches", coach: "Branches fork and get thinner. They should never be thicker than the limb they grow from. Keep the gesture open — like a dancer’s arms.", hint: "Avoid perfect symmetry. Nature is lopsided on purpose.", guide: "tree-branches" },
      { title: "Twigs at the tips", coach: "Short, quicker marks at the ends. This is the last of the structure. Resist the urge to scribble foliage yet.", hint: "Stop while you can still count the main limbs.", guide: "tree-twigs" }
    ]
  },
  {
    id: "tree-canopy",
    path: "trees",
    title: "Canopy as clumps",
    level: "Trees · 2",
    minutes: 10,
    blurb: "Do not draw leaves. Draw clouds of leaves sitting on the skeleton.",
    steps: [
      { title: "Place the masses", coach: "Think broccoli, not parsley. Big overlapping ovals first. Leave sky-holes so the canopy can breathe.", hint: "Some branches should still poke through.", guide: "tree-masses" },
      { title: "Scribble the edge", coach: "A loose, wandering edge sells foliage. Keep the interior quieter than the silhouette.", hint: "Vary the pressure at the outline — broken edges feel alive.", guide: "tree-scribble" }
    ]
  },
  {
    id: "tree-value",
    path: "trees",
    title: "Core shadow & finish",
    level: "Trees · 3",
    minutes: 12,
    blurb: "Light direction, a dark core, and people for scale. This is how a diagram becomes a tree.",
    steps: [
      { title: "Decide the sun", coach: "Sun is upper-left. The right-hand and underside of each clump go darker. Leave a light cap on top of the canopy.", hint: "One light source. Don’t invent a second sun.", guide: "tree-sun" },
      { title: "Pack the core", coach: "The darkest dark sits inside the crown, where clumps overlap and the trunk disappears. Hatch in the direction of growth.", hint: "If the tree still looks flat, the core is not dark enough.", guide: "tree-core" },
      { title: "Ground and scale", coach: "A simple ground line, a cast shadow to the right, and two standing figures. People tell the viewer this is a real tree, not a broccoli floret.", hint: "Figures are about a sixth of the tree. No faces needed.", guide: "tree-finish" }
    ]
  },
  {
    id: "tree-full",
    path: "trees",
    title: "One tree, start to finish",
    level: "Studio",
    minutes: 18,
    blurb: "Run the whole method without stopping. The ghost stays faint so you lead.",
    steps: [
      { title: "Build it once", coach: "Skeleton, then clumps, then value, then ground and people. Work in that order even if the guide shows the finished tree. Do not jump to leaves first.", hint: "Ten extra minutes of structure beats ten extra minutes of scribble.", guide: "tree-finish" }
    ]
  },
  {
    id: "palm",
    path: "trees",
    title: "Palm",
    level: "Trees · palm",
    minutes: 12,
    blurb: "A palm is a trunk with a crown of arcs. Fronds are spines first, leaflets second.",
    steps: [
      { title: "Ringed trunk", coach: "A palm trunk is a slim column that flares a little at the ground. Mark the rings as short arcs, not stripes wrapped like a barber pole.", hint: "Lean it. A perfectly vertical palm looks like a lamp post.", guide: "palm-trunk" },
      { title: "Frond spines", coach: "From one crown point, send out long arcs. They droop as they leave the trunk. Count them. Eight is enough.", hint: "The ones in front overlap the trunk. The ones behind stop at the crown.", guide: "palm-spines" },
      { title: "Leaflets", coach: "Short strokes off each spine, longer near the middle of the frond, shorter at the tip. You are suggesting a comb, not drawing every blade.", hint: "Keep the leaflets on a rhythm. Random scribbles read as a bush.", guide: "palm-leaflets" },
      { title: "Shade under the crown", coach: "The darkest tone sits where the fronds pile up against the trunk. A small ground shadow to the right, and the sky stays empty.", hint: "Don’t shade the whole trunk. The lit side stays paper.", guide: "palm-finish" }
    ]
  },
  {
    id: "tree-page",
    path: "trees",
    title: "Fill a page",
    level: "Trees · page",
    minutes: 15,
    blurb: "A page of small trees, each one a fresh decision. The fill-a-page study: variety over one perfect specimen.",
    steps: [
      { title: "Box the page", coach: "Light rectangles first, like windows on a sketchbook page. Six is plenty. The boxes keep each tree from eating its neighbor.", hint: "Draw the boxes lighter than you think. They are fences, not frames to ink.", guide: "grid-boxes" },
      { title: "A different skeleton in each", coach: "One wide, one tall, one lopsided, one with a low fork. Do not copy the same tree six times. Structure only — no leaves yet.", hint: "If two boxes start to match, change the trunk lean in the second.", guide: "grid-skeletons" },
      { title: "Value on half of them", coach: "Pick three trees and give them a core shadow. Leave the other three as skeletons. A page reads better when not everything is finished.", hint: "Same sun for the whole page: upper left.", guide: "grid-value" }
    ]
  },
  {
    id: "wander",
    path: "trees",
    title: "Let a tree appear",
    level: "Play",
    minutes: 8,
    blurb: "No plan. Wander, then recognize a trunk hiding in the scribble.",
    steps: [
      { title: "Wander first", coach: "Fill the page with loose, looping lines. Don’t aim for a tree. After a minute, stop and ask: where is a trunk hiding? Darken that path.", hint: "Discovery, not construction. Keep most of the scribble.", guide: "wander" }
    ]
  },
  {
    id: "shop-block",
    path: "architecture",
    title: "Shop house in boxes",
    level: "Street · 1",
    minutes: 10,
    blurb: "Machiya / shophouse: get the big rectangles true before any tiles.",
    steps: [
      { title: "Ground, eaves, party walls", coach: "One ground line. Two vertical party walls. A slightly projecting eave. The facade is a stack of rectangles, not a picture of a house.", hint: "Measure with your pen: width against height of the front.", guide: "shop-block" },
      { title: "Floors and openings", coach: "Split the facade into storey bands. Ground floor is taller. Windows align on a grid — even when the woodwork will be irregular.", hint: "Leave the door darker and slightly off-center.", guide: "shop-openings" }
    ]
  },
  {
    id: "shop-detail",
    path: "architecture",
    title: "Wood, tiles, signage",
    level: "Street · 2",
    minutes: 14,
    blurb: "The timelapse layer: rhythm of tiles, bars, a figure on the street.",
    steps: [
      { title: "Rhythm, not inventory", coach: "Suggest tiles with repeating short strokes. Suggest bars with a few verticals, not all of them. The eye finishes the pattern.", hint: "Cluster detail near the entrance. Let the upper wall stay quieter.", guide: "shop-detail" },
      { title: "Street life", coach: "A person, a shadow under the eave, and a darker interior through the door. That’s what makes the shop feel open.", hint: "Cast shadows matter more than the sign lettering.", guide: "shop-life" }
    ]
  },
  {
    id: "one-point",
    path: "architecture",
    title: "One-point street",
    level: "Street · 3",
    minutes: 12,
    blurb: "A street that goes away from you. One vanishing point does all the work.",
    steps: [
      { title: "Horizon and the point", coach: "Draw the horizon where your eye would sit if you were standing in the street. Mark one point on it. Every edge that runs away from you aims there.", hint: "Put the point a little off center so the street isn’t a textbook diagram.", guide: "street-vp" },
      { title: "Road and blocks", coach: "The road is a trapezoid aimed at the point. Buildings are boxes whose top and bottom edges also aim there. Near corners are taller on the page than far ones.", hint: "Verticals stay vertical. Only the depth lines converge.", guide: "street-masses" },
      { title: "Openings and a figure", coach: "Windows get smaller as they approach the point. A person near the foreground tells you the buildings are buildings, not wedges.", hint: "Don’t invent a second vanishing point for the windows.", guide: "street-life" }
    ]
  },
  {
    id: "window-rhythm",
    path: "architecture",
    title: "Window rhythm",
    level: "Street · 4",
    minutes: 10,
    blurb: "A facade is a beat. Sills line up. The openings repeat, then the shadows do.",
    steps: [
      { title: "Sill and jamb lines", coach: "Draw the wall, then the horizontal courses where sills and heads sit. Three storeys. The lines run across the whole facade before any window is a window.", hint: "Spacing can tighten toward the top. The ground storey stays the tallest.", guide: "windows-lines" },
      { title: "Repeat the opening", coach: "Same width, same inset, over and over. A shop window on the ground floor can break the beat once. Everything else keeps time.", hint: "Leave a margin of wall at the edges. Windows don’t kiss the party wall.", guide: "windows-rhythm" },
      { title: "Recess and shadow", coach: "Each opening is a hole. A dark L on the right and bottom says the glass sits back from the wall. Hatch those, not the whole pane.", hint: "Sun is upper left, same as the trees. The shadow is inside the hole.", guide: "windows-shadow" }
    ]
  },
  {
    id: "figures",
    path: "architecture",
    title: "People for scale",
    level: "Street · extra",
    minutes: 6,
    blurb: "Architectural figures are letters, not portraits: head, coat, two legs.",
    steps: [
      { title: "The few-mark figure", coach: "Oval head, sloped shoulders, a rectangle for the torso, two simple legs. No hands, no face. Repeat the row at different sizes.", hint: "Heads sit higher than you think. Legs are about half the height.", guide: "figures" }
    ]
  }
];

const REFERENCE = {
  lines: {
    technique: "One stroke, from the shoulder",
    read: "A line is a path between two points, made once. Beginners scratch because the hand is doing the work of the arm. Lock the wrist, swing from the shoulder, and look at the end of the line instead of the nib. Speed is what keeps it alive. If you creep, the line wobbles.",
    steps: [
      { example: "Six long lines, almost level, each one a single pass.", exercise: "Ghost the motion in the air twice, then lay each line down once. Do not repair a bad one. Draw the next." },
      { example: "Five arcs, each a single comma from left to right.", exercise: "Draw the curves without steering. If one breaks into steps, slow the arm. Do not add extra strokes on top." },
      { example: "A tube of ellipses, wider through the middle, seen in perspective.", exercise: "Draw through each ellipse as if it continues behind the paper. The far side stays thinner than the near side." }
    ]
  },
  hatching: {
    technique: "Value by spacing, not pressure",
    read: "Darkness comes from how close the lines sit, not from pushing harder. Four steps are enough for almost any beginner sketch: white paper, light, middle, and a packed dark. On a round form the lines bend with the surface, and one side stays lighter because there is only one sun.",
    steps: [
      { example: "Four boxes, from open hatching to lines packed tight.", exercise: "Leave the first box as white paper. Fill the others with parallel lines. Change the gaps, not the pressure." },
      { example: "A cylinder lit from the upper left, with a dark side and a thin light edge.", exercise: "Hatch around the form. Keep a sliver of paper on the lit edge. The dark belongs opposite the sun." }
    ]
  },
  vessels: {
    technique: "Cylinders are ellipses first",
    read: "A mug and a bottle are the same problem: a circle tipped away from you. Draw the lip and the base before the sides, or the object will not sit. The handle is another ellipse growing out of the body, not a letter C glued on. One light from the upper left is enough.",
    steps: [
      { example: "Top and bottom ellipses for a mug and a bottle, no sides yet.", exercise: "Draw only the ellipses. Check that each pair could belong to one object. Do not connect them yet." },
      { example: "Sides, a handle, and a neck joining those ellipses.", exercise: "Connect the ellipses. The handle springs from the mug. The bottle shoulder tightens into the neck." },
      { example: "The same objects with shadow on the right and a cast shadow on the table.", exercise: "Hatch the dark sides. Leave a thin light on the left edge. Put the cast shadow on the table, not as a sticker under the object." }
    ]
  },
  "tree-skeleton": {
    technique: "Structure before leaves",
    read: "A tree drawing fails when the leaves arrive first. The trunk is two bowed lines that flare at the ground and taper as they rise. Branches fork and get thinner. They are never thicker than the limb they grow from. Stop while you can still count the main limbs.",
    steps: [
      { example: "A trunk only: two bowed lines, wider at the ground.", exercise: "Plant the trunk. Leave a little air at the base so it can sit on soil later. It is not a pole." },
      { example: "The same trunk with primary branches, uneven on purpose.", exercise: "Fork the limbs. Keep each one thinner than its parent. Avoid a perfect mirror." },
      { example: "Short twigs at the tips, still no foliage.", exercise: "Add only the quick marks at the ends. If you feel like scribbling leaves, stop." }
    ]
  },
  "tree-canopy": {
    technique: "Foliage is clumps, not leaves",
    read: "You cannot draw every leaf, and you should not try. The crown is a few overlapping clouds with holes of sky. The edge is a loose scribble. The inside stays quieter. Some branches still poke through, or the tree looks like a lollipop.",
    steps: [
      { example: "Big overlapping ovals sitting on the skeleton, with gaps of sky.", exercise: "Place the masses first. Think broccoli, not parsley. Leave holes." },
      { example: "Those masses with a broken, wandering edge.", exercise: "Scribble only the silhouette. Keep the interior calmer than the outline." }
    ]
  },
  "tree-value": {
    technique: "One sun, one dark core",
    read: "A tree looks flat until it has a light direction. Put the sun upper left and keep it there. The top of the crown stays paper. The dark sits inside, where clumps overlap and the trunk disappears. A ground line and two small figures tell you the tree is large.",
    steps: [
      { example: "The crown with a sun mark at upper left and a light cap on top.", exercise: "Decide the sun before you shade. Do not invent a second light." },
      { example: "Hatching packed in the middle of the crown and along the trunk.", exercise: "Darken the core until the tree is no longer a diagram. Hatch in the direction of growth." },
      { example: "Ground line, a cast shadow to the right, and two figures for scale.", exercise: "Add the ground and two people about a sixth of the tree. No faces." }
    ]
  },
  "tree-full": {
    technique: "The whole order, in one sitting",
    read: "The finished example shows everything at once. You still work in order: skeleton, clumps, value, ground and people. Jumping to the leaves is how a careful tree turns into a scribble.",
    steps: [
      { example: "A finished tree, drawn in the order you should follow.", exercise: "Build it once from the inside out, even though the example shows the end. Ten minutes of structure beats ten minutes of leaves." }
    ]
  },
  palm: {
    technique: "A trunk, then arcs, then a comb",
    read: "A palm is not a round tree. The trunk is a slim column with ring marks, usually leaning. Fronds start as long arcs from one point at the crown. Leaflets are short strokes off those spines, longer in the middle, shorter at the tip. Shade lives under the crown, not all over the trunk.",
    steps: [
      { example: "A leaning trunk with short ring arcs.", exercise: "Draw the trunk and the rings. Lean it. A vertical palm looks like a lamp post." },
      { example: "Eight arcs leaving one crown point, drooping as they go.", exercise: "Send the spines out and count them. Front ones overlap the trunk. Back ones stop at the crown." },
      { example: "Short leaflet strokes riding those spines.", exercise: "Add the comb. Keep a rhythm. Random marks read as a bush." },
      { example: "Dark hatching under the crown and a small shadow on the ground.", exercise: "Shade only where the fronds pile up. Leave the lit side of the trunk as paper." }
    ]
  },
  "tree-page": {
    technique: "Many small decisions, one page",
    read: "A page of studies teaches faster than one precious tree. Box the sheet so each sketch has a fence. Change the lean, the fork, and the height every time. Finish the value on only half of them. A page where everything is completed looks less alive.",
    steps: [
      { example: "Six light rectangles, like windows on a sketchbook page.", exercise: "Draw the boxes lighter than you think. They are fences, not frames to ink." },
      { example: "A different trunk and fork in every box.", exercise: "One wide, one tall, one lopsided, one with a low fork. Structure only." },
      { example: "Core shadow on three of the six trees, same sun for all.", exercise: "Shade half the page. Leave the rest as skeletons. Keep the sun upper left." }
    ]
  },
  wander: {
    technique: "Find the tree after the line",
    read: "Not every drawing starts with a plan. A wandering line will accidentally make a trunk. Your job is to notice it and darken that path, and to leave most of the scribble alone.",
    steps: [
      { example: "A loose wandering line with a trunk hiding in it.", exercise: "Fill the page without aiming. Then stop, find a trunk, and darken only that path." }
    ]
  },
  "shop-block": {
    technique: "The building is a stack of boxes",
    read: "Before tiles or signs, a shop house is a ground line, two party walls, and a roof that sticks out a little. Floors are horizontal bands. The ground floor is the tallest. Openings sit on a grid even when the woodwork will later look irregular.",
    steps: [
      { example: "Ground, eaves, and the big rectangle of the front.", exercise: "Measure width against height with your pen. Draw the boxes. Do not draw a picture of a house." },
      { example: "Storey lines, a door, and windows aligned in rows.", exercise: "Split the floors. Keep the door a little off-center and ready to go dark." }
    ]
  },
  "shop-detail": {
    technique: "Suggest the pattern, do not inventory it",
    read: "Detail is a rhythm, not a catalogue. A few tile strokes stand for the whole roof. A few bars stand for the window. Cluster that detail near the door. The thing that makes the shop feel open is the dark inside the doorway, the shadow under the eave, and one person.",
    steps: [
      { example: "Repeating tile marks and a handful of bars, not every one.", exercise: "Suggest the pattern. Let the eye finish it. Keep the upper wall quieter than the entrance." },
      { example: "A figure, a shadow under the eave, and a darker door.", exercise: "Add the street life. The cast shadow matters more than any lettering." }
    ]
  },
  "one-point": {
    technique: "One point, verticals stay vertical",
    read: "A street going away from you needs one vanishing point on the horizon, about where your eye would be if you were standing there. Edges that recede aim at that point. Vertical corners stay vertical. Near things are taller on the page than far things. Windows get smaller as they approach the point, and they use the same point.",
    steps: [
      { example: "A horizon and one marked vanishing point, slightly off center.", exercise: "Draw the horizon and the point. Put the point off center so it does not look like a diagram from a textbook." },
      { example: "A road and building blocks whose depth lines meet at that point.", exercise: "Draw the road as a trapezoid and the buildings as boxes. Do not tilt the verticals." },
      { example: "Smaller windows toward the point, and a person in the foreground.", exercise: "Add openings and one figure. Do not invent a second vanishing point for the windows." }
    ]
  },
  "window-rhythm": {
    technique: "A facade is a beat",
    read: "Windows are not invented one by one. Draw the wall, then the horizontal lines where heads and sills sit, then repeat one opening. The ground storey is the tallest and may break the beat once. Each window is a hole: a dark L on the right and bottom says the glass sits back from the wall.",
    steps: [
      { example: "A wall crossed by the lines of sills and heads.", exercise: "Draw the courses across the whole facade before any window is a window." },
      { example: "The same opening repeated, with one wider shop window below.", exercise: "Keep the rhythm. Leave a margin of wall at the edges." },
      { example: "A short hatch inside the right and bottom of each opening.", exercise: "Shade the recess, not the whole pane. The sun is still upper left." }
    ]
  },
  figures: {
    technique: "People are marks for scale",
    read: "In a sketch of a building, a person is not a portrait. An oval head, a coat, and two legs are enough. Heads sit higher than you expect. Legs are about half the height. Different sizes on the same ground line tell you who is near.",
    steps: [
      { example: "A row of simple figures at different sizes, no faces.", exercise: "Repeat the few marks across the page. No hands, no faces. Change the size, not the recipe." }
    ]
  }
};

const WATCH = {
  lines: {
    story: "A line is a decision you can see. Scratching is a conversation with doubt: the hand keeps asking if it is right. One stroke is the opposite. You choose the end, then you go there. The philosophy is trust. The paper does not need a line that was negotiated.",
    steps: [
      { hand: "The pen lands and leaves in one swing. The wrist stays quiet. The shoulder carries the line.", why: "If you watch the nib, you steer, and steering makes a staircase. Watch the end of the line. The wobble comes from creeping, not from courage." },
      { hand: "Each curve is a comma. The pen does not correct itself halfway along.", why: "A curve is one idea held for the length of the mark. The moment it changes its mind, it stops being a curve and becomes a repair." },
      { hand: "The pen travels the whole ellipse, including the far side you are tempted to skip.", why: "An ellipse is a circle that has turned away from you. Drawing through it is how you believe the form is still there when the edge disappears." }
    ]
  },
  hatching: {
    story: "Tone is not pressure. It is how much paper you are willing to leave alone. Darkness is a crowd of small decisions about distance. The beginner’s mistake is to fill every white, as if emptiness were a failure. White is the light. It is already a value.",
    steps: [
      { hand: "Parallel strokes. The first box stays empty. The gaps shrink as the boxes go on. The pen does not press harder.", why: "You are changing the spacing, not the force. Pressure is a mood. Spacing is a measurement. Measurement is what you can repeat tomorrow." },
      { hand: "The strokes bend around the belly of the cylinder. A thin edge of paper stays on the lit side.", why: "You are not decorating a shape. You are saying where the light refused to go. One sun. A second light is a second story, and the object forgets which way it faces." }
    ]
  },
  vessels: {
    story: "A mug is not a picture of a mug. It is a circle that agreed to become a volume. If you draw the outline first, you are designing a symbol. If you draw the ellipses first, you are putting an object on a table. That is the whole philosophy of form: consequence follows belief.",
    steps: [
      { hand: "Lip and base only. The pen draws the circles tipped away from you, and then it stops.", why: "The sides are a result. Draw them first and you will invent a container that cannot hold anything, because its openings were never circles." },
      { hand: "Now the sides. The handle grows out of the body. The shoulder of the bottle tightens into the neck.", why: "A handle stuck on afterwards is a letter C, not a grip. Things that touch have to share a surface. That is what makes them feel made, rather than assembled." },
      { hand: "Hatch the side the sun cannot see. The shadow on the table is a separate shape, off to the right.", why: "The object and its shadow are different ideas. One describes the form. The other describes the light falling past it and continuing on without it." }
    ]
  },
  "tree-skeleton": {
    story: "A tree is a decision about weight. The trunk has to feel as if it could carry what you have not drawn yet. Leaves are a luxury you have not earned. This is the oldest piece of advice in the book, and the one people skip: structure before appearance.",
    steps: [
      { hand: "Two bowed lines, wider where they meet the ground, tapering as they rise. Not a pole.", why: "A pole is the same thickness because nothing is asked of it. A trunk flares because the whole tree arrives there. The flare is the story of the weight." },
      { hand: "Each limb leaves thinner than the one that holds it. They do not mirror each other.", why: "Symmetry is a human comfort. Growth is a series of unequal bets. The lopsided tree is the one that looks as if it had a life before you drew it." },
      { hand: "Short marks at the tips. Then the pen stops, while the limbs can still be counted.", why: "The moment you cannot count them, you have started decorating. Decoration hides the decision. The skeleton is the decision." }
    ]
  },
  "tree-canopy": {
    story: "You will never draw the leaves, and you should stop wanting to. You draw the place where the leaves agree to be a shape. The sky that remains is part of the tree. A solid crown is a lollipop: a symbol of a tree, drawn by someone who did not look up.",
    steps: [
      { hand: "A few overlapping ovals, with holes of sky left on purpose. Some branches still poke through.", why: "The holes are how you admit that a tree is also air. Without them the crown sits on the trunk like a hat. With them, the trunk disappears into something it is holding." },
      { hand: "The edge wanders. The inside of each clump stays quieter than the silhouette.", why: "The eye reads a shape against the sky before it reads a texture. Spend the ink where the tree meets the air. The interior can be a rumor." }
    ]
  },
  "tree-value": {
    story: "Light is a choice you announce and then obey. The dark is not everywhere the tree is. It is where the tree hides from itself: inside the crown, under the clumps, behind the trunk. Flatness is not a lack of detail. It is a lack of a place the light cannot reach.",
    steps: [
      { hand: "Mark the sun once, upper left. Leave the top of the crown as bare paper.", why: "You are making a promise. Everything darker that follows has to agree with it. A second sun is how drawings start lying without noticing." },
      { hand: "Pack the dark inside, where the clumps overlap and the trunk goes missing.", why: "This is the core. If you shade the outline instead, you get a sticker. The darkness belongs in the middle, because that is where the light actually fails." },
      { hand: "A ground line, a shadow falling to the right, and two people with no faces.", why: "Scale is a story, not a measurement you write in the margin. Without a person, it is a diagram of a tree. With one, it is a place someone could stand." }
    ]
  },
  "tree-full": {
    story: "The finished drawing hides the order that made it. Your hand should not. Structure, then mass, then light, then a sign that a person could stand there. Copying the ending is how a careful tree becomes a scribble. The sequence is the thinking.",
    steps: [
      { hand: "The pen still starts at the trunk, even though the page already knows the ending.", why: "Seeing the whole thing at once is a privilege of the viewer. The drawer does not get it. You earn the crown by building the thing that holds it." }
    ]
  },
  palm: {
    story: "A palm is a different sentence from a round tree. It does not clump. It radiates. The thinking is a center, then arcs, then a comb. If you skip the count, it collapses back into a bush, which is a different plant and a different idea.",
    steps: [
      { hand: "A slim column, a little off vertical. The rings are short arcs, not stripes wrapped around a pole.", why: "A barber-pole stripe describes a pattern you remember. A short arc describes a surface you are looking at from the side. Lean it, or it becomes a lamp post with ambitions." },
      { hand: "Long arcs from one point at the crown, drooping as they leave. The pen can count them. Eight is enough.", why: "If you do not know how many, you are filling space. A number is a decision. A cloud of fronds is a wish that the drawing will resolve itself." },
      { hand: "Strokes off each spine, longer near the middle, shorter at the tip. A rhythm, not a scribble.", why: "A frond is a comb. Random marks are a bush. The difference is whether the pen remembers the spine it just drew." },
      { hand: "Dark only where the fronds pile against the trunk. The lit side of the trunk stays paper.", why: "Shade follows the crowd, not the object. The trunk is not dark because it is a trunk. It is dark where the crown denies it the sun." }
    ]
  },
  "tree-page": {
    story: "One careful tree teaches you to finish. A page of trees teaches you to decide. Variety is the subject, and so is leaving some of them unfinished. A page where everything is completed has no air in it. It is a trophy, not a study.",
    steps: [
      { hand: "Light rectangles first. Fences, not frames. The pen stays lighter than it wants to.", why: "Without a border, one tree eats its neighbors. The box is a promise to stop. Stopping is a skill, same as starting." },
      { hand: "A different trunk in every box. Change the lean. Change where it forks.", why: "Repeating the same tree is comfort. The exercise is the discomfort of a new first mark, six times, before you have settled on a favorite." },
      { hand: "Shade only half the page. The same sun falls on all of them.", why: "The unfinished trees are not failures. They are the reminder that you were thinking, not producing. One light across the page is what makes them a set instead of six accidents." }
    ]
  },
  wander: {
    story: "Sometimes the line knows before you do. This is the opposite of the skeleton, and you should know both. Construction decides, then draws. Recognition draws, then notices. Most of the scribble stays, because that is the weather the trunk grew in.",
    steps: [
      { hand: "The pen wanders with no tree in mind. Then it comes back and darkens only the path that turned out to be a trunk.", why: "Hunting for a picture makes you correct the line before it has said anything. Looking at the line lets a picture occur. You are not inventing a tree. You are admitting one." }
    ]
  },
  "shop-block": {
    story: "A building is not the house you remember. It is a stack of measurements. If the big rectangles are true, the tiles and the sign have somewhere honest to live. If they are not, every detail you add is a decoration on a lie.",
    steps: [
      { hand: "Ground, two party walls, an eave that sticks out a little. The pen checks width against height before it falls in love with the doorway.", why: "The eye wants to draw the shop it knows. The pen should draw the proportions it can prove. Affection can arrive after the box is true." },
      { hand: "Horizontal bands for the floors. The ground floor is the tall one. The door sits a little off center.", why: "Alignment is the quiet story of a facade. People feel a rhythm before they can say what is repeating. The off-center door is the first sign that someone uses this place." }
    ]
  },
  "shop-detail": {
    story: "Detail is a rumor you start and then trust the eye to finish. Drawing every tile is a kind of not-seeing: you are so busy recording that you stop choosing. A shop feels open because of the dark you do not explain.",
    steps: [
      { hand: "A few tile strokes. A few bars. Cluster them near the door. Let the upper wall stay quiet.", why: "Repetition is implied by rhythm, not by inventory. The quiet wall is what makes the entrance matter. If everything speaks, nothing is a door." },
      { hand: "One person. The dark inside the doorway. The shadow under the eave.", why: "A shop is open because of what you cannot quite see in it. The lettering on the sign is the least important truth on the street." }
    ]
  },
  "one-point": {
    story: "Perspective is not a grid you suffer through. It is one agreement: edges that leave you will meet again. Everything else in the picture is allowed to stay itself. Verticals still hold the roof up. They do not lean just because the street does.",
    steps: [
      { hand: "A horizon where your eye would be if you were standing in the street. One point on it, a little off center.", why: "The center is a textbook. A real street is slightly more interested in one side. The point is your eye, not a decoration in the middle of the sky." },
      { hand: "The road becomes a trapezoid aimed at that point. Building tops and bottoms aim there too. Vertical corners stay vertical.", why: "Beginners tilt the walls because the whole picture feels as if it should lean into the distance. Only the depth leans. Gravity has not changed." },
      { hand: "Windows shrink as they approach the point. A person stands near you, larger than the distant doors.", why: "The figure is not a garnish. It is the proof that those wedges are buildings, and that you are standing somewhere in particular." }
    ]
  },
  "window-rhythm": {
    story: "A facade is a beat you can tap. Once the beat is true, a single break — the shop window — feels like music instead of a mistake. Windows invented one by one always drift. They drift because each one was a new opinion.",
    steps: [
      { hand: "The wall first. Then the horizontal courses where heads and sills will sit, across the whole facade, before any hole is a hole.", why: "Those lines are the promise the windows share. Draw the windows first and you will negotiate each one against its neighbor, and the building will never quite agree with itself." },
      { hand: "The same opening, again and again. A margin of wall at the edges. One wider shop window on the ground, once.", why: "The margin is the breath. Openings that touch the edge stop being windows and become a cut in the paper. The one break works only because the beat was already true." },
      { hand: "A dark L inside the right and the bottom of each opening. Not a filled pane.", why: "You are not coloring glass. You are saying the wall has thickness, and the light knows it. The shadow is the depth. The glass can stay as paper." }
    ]
  },
  figures: {
    story: "A person in a sketch of a building is a unit of measure that happens to be alive. The moment you give them a face, you have changed the subject. The building becomes a background to a portrait, and the portrait is one you do not have time to draw well.",
    steps: [
      { hand: "An oval, a slope of shoulders, a coat, two legs. The pen repeats it, and changes only the size.", why: "Heads sit higher than kindness would put them. The scale of the street depends on that. No face, because a face would ask to be looked at, and you brought the person here to measure the door." }
    ]
  }
};

LESSONS.forEach((lesson, index) => {
  const ref = REFERENCE[lesson.id];
  const watch = WATCH[lesson.id];
  lesson.chapter = String(index + 1).padStart(2, "0");
  if (watch) lesson.story = watch.story;
  if (!ref) return;
  lesson.technique = ref.technique;
  lesson.read = ref.read;
  lesson.steps.forEach((step, i) => {
    const extra = ref.steps[i] || {};
    const seen = (watch && watch.steps[i]) || {};
    step.example = extra.example || step.hint;
    step.exercise = extra.exercise || step.coach;
    step.hand = seen.hand || step.coach;
    step.why = seen.why || step.hint;
  });
});


