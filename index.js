const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

// Function to read JSON file
function readJsonFileSync(filepath, encoding) {
  if (typeof encoding === 'undefined') {
    encoding = 'utf8';
  }
  const file = fs.readFileSync(filepath, encoding);
  return JSON.parse(file);
}

// Path to JSON file
const jsonFilePath = path.join(__dirname, 'census.json');

// Read JSON file
const jsonData = readJsonFileSync(jsonFilePath);

// Transform function
function transformData(data) {
  const transformed = {
    congregation: {
      ElderShip: []
    }
  };

  const eldersMap = {};

  data.forEach(entry => {
    const elderKey = `${entry.ElderShip}-${entry.RsdntCongrName}`;
    if (!eldersMap[elderKey]) {
      eldersMap[elderKey] = {
        name: entry.ElderShip,
        OverseerShip: entry.OverseerShip,
        RsdntCongrName: entry.RsdntCongrName,
        priests: []
      };
      transformed.congregation.ElderShip.push(eldersMap[elderKey]);
    }

    const priestKey = entry.prstAdminSortName;
    let priest = eldersMap[elderKey].priests.find(p => p.prstAdminSortName === priestKey);
    if (!priest) {
      priest = {
        prstAdminSortName: entry.prstAdminSortName,
        families: []
      };
      eldersMap[elderKey].priests.push(priest);
    }

    const familyKey = entry.Surname;
    let family = priest.families.find(f => f.name === familyKey);
    if (!family) {
      family = {
        name: familyKey,
        MemAddress: entry.MemAddress || "Address not provided",
        members: []
      };
      priest.families.push(family);
    }

    const member = {
      Age: entry.Age,
      Birthdate: entry.Birthdate.trim(),
      CenGroup: entry.CenGroup,
      Gender: entry.Gender,
      IDNO: entry.IDNO,
      Name1: entry.Name1,
      Name2: entry.Name2,
      Surname: entry.Surname
    };

    family.members.push(member);
  });

  return transformed;
}

// Endpoint to get transformed data
app.get('/transformed-data', (req, res) => {
  const transformedData = transformData(jsonData);
  res.json(transformedData);
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}/transformed-data`);
});
