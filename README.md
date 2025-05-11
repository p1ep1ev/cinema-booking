#Cinema Booking Programm

Состав команды:

Правдина Анна - Backend

Ефимов Дмитрий - QA Enginer 

Петров Иван - Fronted


##Как развернуть проект
1.Убедитесь что установлен NodeJS версии 23+ (Electron не поддерживает развертывание из WSL, используйте Windows CMD или Linux)
```bash
node --version # v23.11.0
```
2.Разверните проект командой
```bash
npm ci
```
3.Запустите приложение командой
```bash
npm run start
```
4.Для того чтобы скомпилировать приложение (Необходим установленный WiX Toolset)
```bash
npm run make
```
5.Для запуска тестов
```bash
npm test
```