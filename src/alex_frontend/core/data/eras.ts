export interface Era {
    value: number;          // The value of the era (e.g., 1, 2, 3, ...)
    label: string;          // The label of the era (e.g., "Prehistoric (Before 2,000 BC)")
    range: [number, number]; // A tuple representing the range of years (e.g., [-10000, -2000])
}

const eras: Era[] = [
    { value: 1, label: "Prehistoric (Before 2,000 BC)", range: [-10000, -2000] },
    { value: 2, label: "Ancient (2000BC to 500BC)", range: [-2000, -500] },
    { value: 3, label: "Classical Antiquity (500BC to 0)", range: [-500, 0] },
    { value: 4, label: "Late Antiquity and Early Middle Ages (0 to 500)", range: [0, 500] },
    { value: 5, label: "Early Medieval (500 to 1000)", range: [500, 1000] },
    { value: 6, label: "High Medieval (1000 to 1300)", range: [1000, 1300] },
    { value: 7, label: "Late Middle Age, Early Renaissance (1300 to 1500)", range: [1300, 1500] },
    { value: 8, label: "Renaissance (1500 to 1700)", range: [1500, 1700] },
    { value: 9, label: "Age of Enlightenment (1700 to 1800)", range: [1700, 1800] },
    { value: 10, label: "Early Industrial (1800 to 1850)", range: [1800, 1850] },
    { value: 11, label: "Late Industrial (1850 to 1900)", range: [1850, 1900] },
    { value: 12, label: "Early 20th Century (1900 to 1950)", range: [1900, 1950] },
    { value: 13, label: "Post-War (1950 to 1975)", range: [1950, 1975] },
    { value: 14, label: "Late 20th Century (1975 to 2000)", range: [1975, 2000] },
    { value: 15, label: "Early 21st Century (2000 to 2020)", range: [2000, 2020] },
    { value: 16, label: "Contemporary (2020 onwards)", range: [2020, 10000] },
];


export default eras;