import React, { useState } from "react";
import { Button, TextField, Table } from "@radix-ui/themes";

const NutritionChecker = () => {
  const [ingredient, setIngredient] = useState("");
  const [nutrition, setNutrition] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const appId = "f551b0a5"; // replace with your actual app ID
    const appKey = "2012ae48321f3efa159d200ec3e737d7"; // replace with your actual app key

    const url = `https://api.edamam.com/api/nutrition-data?app_id=${appId}&app_key=${appKey}&ingr=${encodeURIComponent(
      ingredient
    )}`;

    try {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Error: ${res.status} ${res.statusText}`);
      }
      const data = await res.json();
      console.log("API Response:", data); // Log the response to inspect its structure
      setNutrition(data);
    } catch (err) {
      console.error("Failed to fetch nutrition data:", err);
      alert(
        "Failed to fetch nutrition data. Please check your API credentials or try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 size-full flex flex-col items-center justify-center">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        {!loading && !nutrition && (
          <>
            <TextField.Root
                size="3"
              onChange={(e) => setIngredient(e.target.value)}
              value={ingredient}
              placeholder="e.g., 1 cup rice"
            ></TextField.Root>
            <Button
                size="3"
              type="submit"
              className="bg-ruby-500 text-white px-4 py-2 rounded"
            >
              Check Nutrition
            </Button>
          </>
        )}
        {loading && (
          <Button loading={true} className="bg-ruby-500 text-white px-4 py-2 rounded">
            Loading...
          </Button>
        )}
        
      </form>
      {nutrition && nutrition.ingredients && nutrition.ingredients[0]?.parsed?.[0]?.nutrients && (
        <Table.Root variant="surface" className="mt-4">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>Nutrient</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Amount</Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            <Table.Row>
              <Table.RowHeaderCell>Calories</Table.RowHeaderCell>
              <Table.Cell>
                {nutrition.ingredients[0].parsed[0].nutrients.ENERC_KCAL
                  ? `${nutrition.ingredients[0].parsed[0].nutrients.ENERC_KCAL.quantity} kcal`
                  : "N/A"}
              </Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.RowHeaderCell>Protein</Table.RowHeaderCell>
              <Table.Cell>
                {nutrition.ingredients[0].parsed[0].nutrients.PROCNT
                  ? `${nutrition.ingredients[0].parsed[0].nutrients.PROCNT.quantity} g`
                  : "N/A"}
              </Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.RowHeaderCell>Fat</Table.RowHeaderCell>
              <Table.Cell>
                {nutrition.ingredients[0].parsed[0].nutrients.FAT
                  ? `${nutrition.ingredients[0].parsed[0].nutrients.FAT.quantity} g`
                  : "N/A"}
              </Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.RowHeaderCell>Carbs</Table.RowHeaderCell>
              <Table.Cell>
                {nutrition.ingredients[0].parsed[0].nutrients.CHOCDF
                  ? `${nutrition.ingredients[0].parsed[0].nutrients.CHOCDF.quantity} g`
                  : "N/A"}
              </Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.RowHeaderCell>Fiber</Table.RowHeaderCell>
              <Table.Cell>
                {nutrition.ingredients[0].parsed[0].nutrients.FIBTG
                  ? `${nutrition.ingredients[0].parsed[0].nutrients.FIBTG.quantity} g`
                  : "N/A"}
              </Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.RowHeaderCell>Sugar</Table.RowHeaderCell>
              <Table.Cell>
                {nutrition.ingredients[0].parsed[0].nutrients.SUGAR
                  ? `${nutrition.ingredients[0].parsed[0].nutrients.SUGAR.quantity} g`
                  : "N/A"}
              </Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.RowHeaderCell>Sodium</Table.RowHeaderCell>
              <Table.Cell>
                {nutrition.ingredients[0].parsed[0].nutrients.NA
                  ? `${nutrition.ingredients[0].parsed[0].nutrients.NA.quantity} mg`
                  : "N/A"}
              </Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table.Root>
      )}
      {!loading && nutrition && (
          <Button
            type="button"
            size="3"
            className="bg-ruby-500 !mt-4 text-white px-4 py-2 rounded"
            onClick={() => {
              setNutrition(null);
              setIngredient("");
            }}
          >
            Reset
          </Button>
        )}
    </div>
  );
};

export default NutritionChecker;
