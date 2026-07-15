# Workflow de desarrollo

Cuando se trabaje en una issue de GitHub en este repositorio, seguir siempre este flujo:

1. `git checkout main`
2. `git pull`
3. Crear una rama con nombre en inglés, formato `numIssue-issue-description` (ej. `189-move-enrichedstream-under-stream`), y moverse a ella.
4. Implementar el código correspondiente a la issue, aplicando SOLID, KISS, DRY y los principios ya presentes en el proyecto (arquitectura por capas Domain/Application/Infrastructure, inyección manual de dependencias vía `container.ts`).
5. Ejecutar la suite de tests (`npm test`) y confirmar que todo pasa antes de continuar.
6. `git add .`
7. Commit en inglés con el formato: `git commit -m "[#numIssue] - description of code done"`
8. `git push origin branch-name`
9. Abrir una PR con título corto en inglés y una breve descripción en inglés, incluyendo `Closes #numIssue` por cada issue que cierre.

No saltarse pasos ni combinar varias issues en una misma rama/PR salvo que se indique explícitamente lo contrario.
