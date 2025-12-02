type Category = {
  [key: number]: string;
};

export type DDCType = {
  [key: number]: {
    type: string;
    image: string;
    category: Category;
  };
};

const DDC: DDCType = {
  0 : {
    "type": "Generalities and Information Technology",
		"image": "generalities-and-it.png",
    "category": {
      0: "Computer science, knowledge & systems",
      1: "Bibliographies",
      2: "Library & information sciences",
      3: "Factbooks & encyclopedias",
      4: "Blockchain and cryptocurrencies",
      5: "Magazines and journals",
      6: "Associations, organizations & museums",
      7: "News media, journalism & publishing",
      8: "Quotations",
      9: "Manuscripts & rare books",
    }
  },
  1: {
    "type": "Philosophy",
    "image": "philosophy.png",
    "category": {
      10: "Philosophy & theory of knowledge",
      11: "Metaphysics",
      12: "Epistemology",
      13: "Parapsychology & occultism",
      14: "Philosophical schools of thought",
      15: "Psychology",
      16: "Logic",
      17: "Ethics",
      18: "Ancient, medieval & eastern philosophy",
      19: "Modern western philosophy",
    }
  },
  2: {
    "type": "Religion",
    "image": "religion.png",
    "category": {
      20: "Religion",
      21: "Natural theology",
      22: "The Bible",
      23: "Christianity and Christian theology",
      24: "Christian practice & observance",
      25: "Christian pastoral practice & religious orders",
      26: "Christian organization, social work & worship",
      27: "History of Christianity",
      28: "Christian denominations",
      29: "Other religions",
    }
  },
  3: {
    "type": "Social Sciences",
    "image": "social-sciences.png",
    "category": {
      30: "Social sciences, sociology & anthropology",
      31: "Statistics",
      32: "Political science",
      33: "Economics",
      34: "Law",
      35: "Public administration",
      36: "Social problems & social services",
      37: "Education",
      38: "Commerce, communications, transport",
      39: "Customs, etiquette, folklore",
    }
  },
  4: {
    "type": "Language",
    "image": "language.png",
    "category": {
      40: "Linguistics",
      41: "Writing systems",
      42: "English & Old English languages",
      43: "German & related languages",
      44: "French & related languages",
      45: "Italian, Romanian & related languages",
      46: "Spanish, Portuguese, Galician",
      47: "Latin & Italic languages",
      48: "Classical Greek",
      49: "Other languages",
    }
  },
  5: {
    "type": "Science",
    "image": "science.png",
    "category": {
      50: "Science",
      51: "Mathematics",
      52: "Astronomy",
      53: "Physics",
      54: "Chemistry",
      55: "Earth sciences and geology",
      56: "Fossils & prehistoric life",
      57: "Life sciences, biology",
      58: "Plants (Botany)",
      59: "Animals (Zoology)",
    }
  },
  6: {
    "type": "Technology",
    "image": "technology.png",
    "category": {
      60: "Computing",
      61: "Medicine & health",
      62: "Engineering",
      63: "Agriculture",
      64: "Home & family management",
      65: "Management & public relations",
      66: "Chemical engineering",
      67: "Manufacturing",
      68: "Manufacture for specific uses",
      69: "Building & construction",
    }
  },
  7: {
    "type": "Arts and Recreation",
    "image": "art-and-recreation.png",
    "category": {
      70: "The arts",
      71: "Landscaping and area planning",
      72: "Architecture",
      73: "Sculpture, ceramics & metalwork",
      74: "Drawing & decorative arts",
      75: "Painting",
      76: "Graphic arts",
      77: "Photography & computer art",
      78: "Music",
      79: "Sports, games & entertainment",
    }
  },
  8: {
    "type": "Literature",
    "image": "literature.png",
    "category": {
      80: "Literature, rhetoric & criticism",
      81: "American literature in English",
      82: "English & Old English literatures",
      83: "German & related literatures",
      84: "French & related literatures",
      85: "Italian, Romanian & related literatures",
      86: "Spanish, Portuguese, Galician",
      87: "Latin & Italic literatures",
      88: "Classical and modern Greek literatures",
      89: "Other literatures",
    }
  },
  9: {
    "type": "History and Geography",
    "image": "history-and-geography.png",
    "category": {
      90: "History",
      91: "Geography & travel",
      92: "Biography & genealogy",
      93: "Ancient world",
      94: "Europe",
      95: "Asia",
      96: "Africa",
      97: "North America",
      98: "South America",
      99: "Oceania & other areas",
    }
  }
}

export default DDC;