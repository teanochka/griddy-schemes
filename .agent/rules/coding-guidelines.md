---
trigger: always_on
---

- SOLID Principles: Follow Single Responsibility, Open-Closed, Liskov Substitution, Interface Segregation, and Dependency Inversion principles for maintainable and extensible code.
- DRY (Don't Repeat Yourself): Avoid code duplication by extracting common logic into reusable functions, classes, or modules.
- KISS (Keep It Simple, Stupid): Strive for simplicity in design and implementation. Avoid over-engineering.
- Clean Code: Write readable, self-documenting code with meaningful names, small functions, and clear structure.
- Error Handling: Implement robust error handling and logging to aid debugging and maintain reliability. Use low-cardinality logging with stable message strings e.g. logger.info{id, foo}, 'Msg', logger.error({error}, 'Another msg'), etc
- Performance: Optimize for performance where necessary, but prioritize readability and maintainability.