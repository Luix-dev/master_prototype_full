const express = require('express');
const router = express.Router();
const neo4j = require('neo4j-driver');
const { v4: uuidv4 } = require('uuid');


// Assuming driver is initialized elsewhere and passed here
module.exports = function(driver) {

  // GET all entities
  router.get('/entities', async (req, res) => {
    const session = driver.session();
    try {
      const result = await session.run('MATCH (e:Entity) RETURN e');
      const entities = result.records.map(record => record.get('e').properties);
      res.json(entities);
    } catch (error) {
      console.error('Error fetching entities:', error);
      res.status(500).send('Error fetching entities');
    } finally {
      await session.close();
    }
  });

  // GET a single entity by ID
  router.get('/entities/:id', async (req, res) => {
    const entityId = req.params.id;
    const session = driver.session();
    try {
      const result = await session.run('MATCH (e:Entity {id: $entityId}) RETURN e', { entityId });
      const entity = result.records[0]?.get('e').properties;
      res.json(entity);
    } catch (error) {
      console.error(`Error fetching entity with ID ${entityId}:`, error);
      res.status(500).send(`Error fetching entity with ID ${entityId}`);
    } finally {
      await session.close();
    }
  });

  // POST create a new entity
  router.post('/entities', async (req, res) => {
    const id = uuidv4();
    const session = driver.session();
    try {
        const result = await session.run(
            'CREATE (e:Entity {id: $id, name: "Test Entity", type: "TestType"}) RETURN e',
            { id }
        );
        const createdEntity = result.records[0]?.get('e').properties;
        res.status(201).json(createdEntity);
    } catch (error) {
        console.error('Error creating entity:', error);
        res.status(500).send('Error creating entity: ' + error.message);
    } finally {
        await session.close();
    }
});

  

  // PUT update an entity
  router.put('/entities/:id', async (req, res) => {
    const entityId = req.params.id;
    const updateData = req.body;
    const session = driver.session();
    try {
      // Example Cypher query, adjust according to your data model
      const result = await session.run('MATCH (e:Entity {id: $entityId}) SET e += $updateData RETURN e', { entityId, updateData });
      const updatedEntity = result.records[0]?.get('e').properties;
      res.json(updatedEntity);
    } catch (error) {
      console.error(`Error updating entity with ID ${entityId}:`, error);
      res.status(500).send(`Error updating entity with ID ${entityId}`);
    } finally {
      await session.close();
    }
  });


    // DELETE entities by type
router.delete('/entities/type/:type', async (req, res) => {
    const entityType = req.params.type;
    const session = driver.session();
    try {
      await session.run('MATCH (e:Entity {type: $entityType}) DELETE e', { entityType });
      res.status(200).send(`Entities with type '${entityType}' deleted successfully`);
    } catch (error) {
      console.error(`Error deleting entities with type ${entityType}:`, error);
      res.status(500).send(`Error deleting entities with type ${entityType}`);
    } finally {
      await session.close();
    }
  });
  

  // Advanced Filtering (as an example)
  router.get('/entities/filter', async (req, res) => {
    // Extract query parameters for filtering (e.g., type, name)
    const { type, name } = req.query;
    const session = driver.session();
    try {
      // Example Cypher query, adjust according to your data model and filtering needs
      const result = await session.run('MATCH (e:Entity) WHERE e.type = $type AND e.name = $name RETURN e', { type, name });
      const entities = result.records.map(record => record.get('e').properties);
      res.json(entities);
    } catch (error) {
      console.error('Error filtering entities:', error);
      res.status(500).send('Error filtering entities');
    }
    finally {
        await session.close();
    }
    });

// Additional routes can be added here based on your requirements

return router;
};
