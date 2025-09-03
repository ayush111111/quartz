---
title: "Design Patterns"
date: 2025-09-01

---

# Gang of Four Design Patterns

_LLMs were used to create this summary_

A Python-centric, expert-level guide to the 23 Gang of Four (GoF) design patterns. This document explains the patterns, gives short analyses, and provides compact Python examples. Code examples are illustrative, idiomatic, and formatted as fenced code blocks for readability.

---

## Introduction


The sections below present each pattern with:

- Purpose / When to use
- Key components (concise)
- A short Python example

---

## Part I — Creational Patterns

Creational patterns control object creation to promote loose coupling and flexibility.

### 1. Singleton

Purpose: Ensure a class has only one instance and provide a global access point.

Key points:

- Use for centralized services (config, logging).
- Be cautious: can become a hidden global and hurt testability.

Example (Python):

```python
class Logger:
    _instance = None

    def __init__(self):
        """
        The constructor is private. It is not intended for external use.
        """
        raise RuntimeError("Call get_instance() instead")

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            # Lazy initialization for the first time it's accessed
            cls._instance = cls.__new__(cls)
            print("Logger instance created.")
        return cls._instance

    def log(self, message):
        print(f"Log: {message}")


# Usage
logger1 = Logger.get_instance()
logger2 = Logger.get_instance()

print(f"Are logger1 and logger2 the same instance? {logger1 is logger2}")
logger1.log("This is the first log message.")
logger2.log("This is the second log message.")
```
Python’s module system naturally provides singleton-like behavior. Explicit Singleton classes are almost never needed.
https://www.pixelstech.net/article/1754987478-please-stop-asking-about-singleton-in-python

### 2. Factory Method

Purpose: Define an interface for creating an object, letting subclasses decide which class to instantiate.

Example:

```python
from abc import ABC, abstractmethod

# Product Interface
class Vehicle(ABC):
    @abstractmethod
    def get_type(self):
        pass

# Concrete Products
class Car(Vehicle):
    def get_type(self):
        return "Car"

class Truck(Vehicle):
    def get_type(self):
        return "Truck"

# Creator Interface
class VehicleFactory(ABC):
    @abstractmethod
    def create_vehicle(self) -> Vehicle:
        pass

    def get_vehicle_info(self):
        vehicle = self.create_vehicle()
        return f"A new {vehicle.get_type()} has been created."

# Concrete Creators
class CarFactory(VehicleFactory):
    def create_vehicle(self):
        return Car()

class TruckFactory(VehicleFactory):
    def create_vehicle(self):
        return Truck()

# Usage
car_factory = CarFactory()
print(car_factory.get_vehicle_info())

truck_factory = TruckFactory()
print(truck_factory.get_vehicle_info())
```

### 3. Abstract Factory

Purpose: Create families of related objects without specifying concrete classes.

Example:

```python
from abc import ABC, abstractmethod

# Abstract Products
class Button(ABC):
    @abstractmethod
    def get_style(self):
        pass

class Checkbox(ABC):
    @abstractmethod
    def get_style(self):
        pass

# Concrete Products
class WindowsButton(Button):
    def get_style(self):
        return "Windows-style button"

class MacOSButton(Button):
    def get_style(self):
        return "MacOS-style button"

class WindowsCheckbox(Checkbox):
    def get_style(self):
        return "Windows-style checkbox"

class MacOSCheckbox(Checkbox):
    def get_style(self):
        return "MacOS-style checkbox"

# Abstract Factory
class GUIFactory(ABC):
    @abstractmethod
    def create_button(self) -> Button:
        pass

    @abstractmethod
    def create_checkbox(self) -> Checkbox:
        pass

# Concrete Factories
class WindowsFactory(GUIFactory):
    def create_button(self):
        return WindowsButton()

    def create_checkbox(self):
        return WindowsCheckbox()

class MacOSFactory(GUIFactory):
    def create_button(self):
        return MacOSButton()

    def create_checkbox(self):
        return MacOSCheckbox()

# Client Code
def create_ui(factory: GUIFactory):
    button = factory.create_button()
    checkbox = factory.create_checkbox()
    print(f"Created UI with a {button.get_style()} and a {checkbox.get_style()}.")

# Usage
windows_ui = WindowsFactory()
create_ui(windows_ui)

macos_ui = MacOSFactory()
create_ui(macos_ui)
```

### 4. Builder

Purpose: Separate the construction of a complex object from its representation.

Example:

```python
from abc import ABC, abstractmethod

# Product
class Report:
    def __init__(self):
        self.sections = []

    def add_section(self, section):
        self.sections.append(section)

    def display(self):
        print("--- Report ---")
        for section in self.sections:
            print(section)
        print("--------------")

# Builder Interface
class ReportBuilder(ABC):
    @abstractmethod
    def build_header(self):
        pass

    @abstractmethod
    def build_body(self):
        pass

    @abstractmethod
    def build_footer(self):
        pass

    @abstractmethod
    def get_report(self) -> Report:
        pass

# Concrete Builders
class HTMLReportBuilder(ReportBuilder):
    def __init__(self):
        self.report = Report()

    def build_header(self):
        self.report.add_section("<h1>HTML Report Header</h1>")

    def build_body(self):
        self.report.add_section("<p>HTML Report Body</p>")

    def build_footer(self):
        self.report.add_section("<footer>HTML Report Footer</footer>")

    def get_report(self):
        return self.report

class PDFReportBuilder(ReportBuilder):
    def __init__(self):
        self.report = Report()

    def build_header(self):
        self.report.add_section("PDF Report Header")

    def build_body(self):
        self.report.add_section("PDF Report Body")

    def build_footer(self):
        self.report.add_section("PDF Report Footer")

    def get_report(self):
        return self.report

# Director
class ReportDirector:
    def __init__(self, builder: ReportBuilder):
        self.builder = builder

    def construct_report(self):
        self.builder.build_header()
        self.builder.build_body()
        self.builder.build_footer()

# Usage
html_builder = HTMLReportBuilder()
director = ReportDirector(html_builder)
director.construct_report()
html_report = html_builder.get_report()
html_report.display()

pdf_builder = PDFReportBuilder()
director = ReportDirector(pdf_builder)
director.construct_report()
pdf_report = pdf_builder.get_report()
pdf_report.display()
```

### 5. Prototype

Purpose: Create objects by copying an existing prototype.

Example:

```python
import copy

class Shape:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def clone(self):
        return copy.deepcopy(self)

class Circle(Shape):
    def __init__(self, x, y, radius):
        super().__init__(x, y)
        self.radius = radius

    def __str__(self):
        return f"Circle at ({self.x}, {self.y}) with radius {self.radius}"

# Client Code
if __name__ == "__main__":
    prototype_circle = Circle(10, 20, 5)
    print(f"Original: {prototype_circle}")

    cloned_circle = prototype_circle.clone()
    cloned_circle.x = 30
    cloned_circle.y = 40
    print(f"Cloned and modified: {cloned_circle}")

    print(f"Original after clone: {prototype_circle}")
    print(f"Are they the same object? {prototype_circle is cloned_circle}")
```

---

## Part II — Structural Patterns

Structural patterns describe object composition and simplify interfaces.

### 6. Adapter

Purpose: Let incompatible interfaces work together by adapting one to the other.

Example:

```python
# Target Interface
class NewPaymentProcessor:
    def charge(self, amount):
        raise NotImplementedError

# Adaptee (Legacy System)
class LegacyPaymentGateway:
    def process_payment(self, amount):
        print(f"Processing payment of ${amount} through legacy gateway.")

# Adapter
class PaymentAdapter(NewPaymentProcessor):
    def __init__(self, legacy_gateway):
        self.legacy_gateway = legacy_gateway

    def charge(self, amount):
        print("Adapter: Converting charge to process_payment...")
        self.legacy_gateway.process_payment(amount)

# Client Code
def process_client_payment(processor: NewPaymentProcessor, amount):
    print("Client: Sending request to processor.")
    processor.charge(amount)

# Usage
legacy_gateway = LegacyPaymentGateway()
payment_adapter = PaymentAdapter(legacy_gateway)
process_client_payment(payment_adapter, 100)
```

### 7. Bridge

Purpose: Decouple an abstraction from its implementation so they can vary independently.

Example:

```python
from abc import ABC, abstractmethod

# Implementer Interface
class Workshop(ABC):
    @abstractmethod
    def work(self):
        pass

# Concrete Implementers
class Produce(Workshop):
    def work(self):
        print("Produced", end="")

class Assemble(Workshop):
    def work(self):
        print(" And Assembled.")

# Abstraction
class Vehicle(ABC):
    def __init__(self, workshop1: Workshop, workshop2: Workshop):
        self.workshop1 = workshop1
        self.workshop2 = workshop2

    @abstractmethod
    def manufacture(self):
        pass

# Refined Abstractions
class Car(Vehicle):
    def __init__(self, workshop1: Workshop, workshop2: Workshop):
        super().__init__(workshop1, workshop2)

    def manufacture(self):
        print("Car ", end="")
        self.workshop1.work()
        self.workshop2.work()

class Bike(Vehicle):
    def __init__(self, workshop1: Workshop, workshop2: Workshop):
        super().__init__(workshop1, workshop2)

    def manufacture(self):
        print("Bike ", end="")
        self.workshop1.work()
        self.workshop2.work()

# Usage
car = Car(Produce(), Assemble())
car.manufacture()

bike = Bike(Produce(), Assemble())
bike.manufacture()
```

### 8. Composite

Purpose: Compose objects into tree structures and treat them uniformly.

Example:

```python
from abc import ABC, abstractmethod

# Component Interface
class Task(ABC):
    @abstractmethod
    def display(self):
        pass

# Leaf
class SimpleTask(Task):
    def __init__(self, title):
        self.title = title

    def display(self):
        print(f"Simple Task: {self.title}")

# Composite
class TaskList(Task):
    def __init__(self, title):
        self.title = title
        self.tasks = []

    def add_task(self, task):
        self.tasks.append(task)

    def remove_task(self, task):
        self.tasks.remove(task)

    def display(self):
        print(f"Task List: {self.title}")
        for task in self.tasks:
            task.display()

# Client Code
if __name__ == "__main__":
    # Creating simple tasks
    simple_task1 = SimpleTask("Complete Coding")
    simple_task2 = SimpleTask("Write Documentation")

    # Creating a task list
    project_tasks = TaskList("Project Tasks")
    project_tasks.add_task(simple_task1)
    project_tasks.add_task(simple_task2)

    # Nested task list
    phase1_tasks = TaskList("Phase 1 Tasks")
    phase1_tasks.add_task(SimpleTask("Design"))
    phase1_tasks.add_task(SimpleTask("Implementation"))

    project_tasks.add_task(phase1_tasks)

    # Displaying tasks
    project_tasks.display()
```

### 9. Decorator

Purpose: Add responsibilities to objects dynamically.

Example:

```python
from abc import ABC, abstractmethod

# Component Interface
class Coffee(ABC):
    @abstractmethod
    def get_description(self):
        pass

    @abstractmethod
    def get_cost(self):
        pass

# Concrete Component
class PlainCoffee(Coffee):
    def get_description(self):
        return "Plain Coffee"

    def get_cost(self):
        return 2.0

# Decorator
class CoffeeDecorator(Coffee):
    def __init__(self, decorated_coffee: Coffee):
        self.decorated_coffee = decorated_coffee

    def get_description(self):
        return self.decorated_coffee.get_description()

    def get_cost(self):
        return self.decorated_coffee.get_cost()

# Concrete Decorators
class MilkDecorator(CoffeeDecorator):
    def get_description(self):
        return self.decorated_coffee.get_description() + ", Milk"

    def get_cost(self):
        return self.decorated_coffee.get_cost() + 0.5

class SugarDecorator(CoffeeDecorator):
    def get_description(self):
        return self.decorated_coffee.get_description() + ", Sugar"

    def get_cost(self):
        return self.decorated_coffee.get_cost() + 0.2

# Usage
plain_coffee = PlainCoffee()
print(f"Description: {plain_coffee.get_description()}, Cost: ${plain_coffee.get_cost()}")

coffee_with_milk = MilkDecorator(PlainCoffee())
print(f"Description: {coffee_with_milk.get_description()}, Cost: ${coffee_with_milk.get_cost()}")

coffee_with_sugar_and_milk = SugarDecorator(MilkDecorator(PlainCoffee()))
print(f"Description: {coffee_with_sugar_and_milk.get_description()}, Cost: ${coffee_with_sugar_and_milk.get_cost()}")
```

### 10. Facade

Purpose: Provide a unified, simple interface to a complex subsystem.

Example:

```python
class CPU:
    def process_data(self):
        print("CPU: Processing data...")

class Memory:
    def load(self):
        print("Memory: Loading data...")

class HardDrive:
    def read_data(self):
        print("HardDrive: Reading boot data...")

# The Facade
class ComputerFacade:
    def __init__(self):
        self.cpu = CPU()
        self.memory = Memory()
        self.hard_drive = HardDrive()

    def start_computer(self):
        print("Starting computer...")
        self.hard_drive.read_data()
        self.memory.load()
        self.cpu.process_data()
        print("Computer started.")

# Client Code
if __name__ == "__main__":
    computer = ComputerFacade()
    computer.start_computer()
```

### 11. Flyweight

Purpose: Share intrinsic state to reduce memory usage when many similar objects exist.

Example:

```python
class CharacterFlyweight:
    def __init__(self, font_name, font_size):
        self.font_name = font_name
        self.font_size = font_size

    def display(self, x, y, color):
        print(f"Displaying character with {self.font_name}, "
              f"size {self.font_size}, at ({x}, {y}) in color {color}.")

class CharacterFactory:
    _character_pool = {}

    def get_character(self, font_name, font_size):
        key = (font_name, font_size)
        if key not in self._character_pool:
            self._character_pool[key] = CharacterFlyweight(font_name, font_size)
            print(f"Created new flyweight for font: {key}")
        return self._character_pool[key]

# Client Code
if __name__ == "__main__":
    factory = CharacterFactory()

    # Create two characters that share the same intrinsic state
    char_A = factory.get_character("Arial", 12)
    char_B = factory.get_character("Arial", 12)

    char_A.display(10, 10, "black")
    char_B.display(20, 10, "red")

    print(f"Are char_A and char_B the same object? {char_A is char_B}")
```

### 12. Proxy

Purpose: Provide a surrogate that controls access to another object.

Example:

```python
from abc import ABC, abstractmethod

# Subject Interface
class Image(ABC):
    @abstractmethod
    def display(self):
        pass

# Real Subject
class RealImage(Image):
    def __init__(self, filename):
        self.filename = filename
        self._load_image_from_disk()

    def _load_image_from_disk(self):
        print(f"Loading image from disk: {self.filename}")

    def display(self):
        print(f"Displaying image: {self.filename}")

# Proxy
class ProxyImage(Image):
    def __init__(self, filename):
        self.filename = filename
        self.real_image = None

    def display(self):
        if self.real_image is None:
            print("Proxy: Real image not loaded. Loading now...")
            self.real_image = RealImage(self.filename)
        self.real_image.display()

# Client Code
if __name__ == "__main__":
    image = ProxyImage("large_image.jpg")
    print("Client: Initialized proxy. The image is not yet loaded.")
    
    # First call will load the image
    image.display()
    print("\n")
    
    # Subsequent calls will use the cached image
    image.display()
```

---

## Part III — Behavioral Patterns

Behavioral patterns define object interaction and responsibility assignment.

### 13. Chain of Responsibility

Purpose: Pass a request along a chain of handlers until one handles it.

Example:

```python
from abc import ABC, abstractmethod

class Handler(ABC):
    def __init__(self, next_handler=None):
        self._next_handler = next_handler

    def set_next(self, handler):
        self._next_handler = handler
        return handler

    @abstractmethod
    def handle(self, request):
        if self._next_handler:
            return self._next_handler.handle(request)
        return None

class InfoHandler(Handler):
    def handle(self, request):
        if request == "info":
            return "Info handled by InfoHandler"
        else:
            return super().handle(request)

class WarningHandler(Handler):
    def handle(self, request):
        if request == "warning":
            return "Warning handled by WarningHandler"
        else:
            return super().handle(request)

class ErrorHandler(Handler):
    def handle(self, request):
        if request == "error":
            return "Error handled by ErrorHandler"
        else:
            return super().handle(request)

# Usage
info_handler = InfoHandler()
warning_handler = WarningHandler()
error_handler = ErrorHandler()

info_handler.set_next(warning_handler).set_next(error_handler)

print(info_handler.handle("warning"))
print(info_handler.handle("error"))
print(info_handler.handle("info"))
print(info_handler.handle("unknown"))
```

### 14. Command

Purpose: Encapsulate a request as an object; enable undo/redo and queuing.

Example:

```python
from abc import ABC, abstractmethod

# Receiver
class Light:
    def turn_on(self):
        print("Light is ON")

    def turn_off(self):
        print("Light is OFF")

# Command Interface
class Command(ABC):
    @abstractmethod
    def execute(self):
        pass

# Concrete Commands
class TurnOnLightCommand(Command):
    def __init__(self, light):
        self.light = light

    def execute(self):
        self.light.turn_on()

class TurnOffLightCommand(Command):
    def __init__(self, light):
        self.light = light

    def execute(self):
        self.light.turn_off()

# Invoker
class RemoteControl:
    def __init__(self):
        self.command = None

    def set_command(self, command):
        self.command = command

    def press_button(self):
        if self.command:
            self.command.execute()

# Usage
light = Light()
turn_on = TurnOnLightCommand(light)
turn_off = TurnOffLightCommand(light)

remote = RemoteControl()
remote.set_command(turn_on)
remote.press_button()

remote.set_command(turn_off)
remote.press_button()
```

### 15. Interpreter

Purpose: Define a representation for a language and interpret sentences in that language.

Example:

```python
class Context:
    def __init__(self, expression):
        self.expression = expression
        self.result = None

# Abstract Expression
class Expression:
    def interpret(self, context):
        pass

# Terminal Expressions
class NumberExpression(Expression):
    def __init__(self, value):
        self.value = value

    def interpret(self, context):
        return self.value

# Non-terminal Expressions
class AdditionExpression(Expression):
    def __init__(self, left, right):
        self.left = left
        self.right = right

    def interpret(self, context):
        return self.left.interpret(context) + self.right.interpret(context)

class MultiplicationExpression(Expression):
    def __init__(self, left, right):
        self.left = left
        self.right = right

    def interpret(self, context):
        return self.left.interpret(context) * self.right.interpret(context)

# Client Code (simplified)
if __name__ == "__main__":
    # Represents "2 + 3 * 4"
    expression = AdditionExpression(
        NumberExpression(2),
        MultiplicationExpression(
            NumberExpression(3),
            NumberExpression(4)
        )
    )

    result = expression.interpret(Context(None))
    print(f"The result of '2 + 3 * 4' is: {result}")
```

### 16. Iterator

Purpose: Provide sequential access to elements without exposing the underlying representation. In Python, use __iter__/__next__.

Example:

```python
class MyIterator:
    def __init__(self, data): self.data = data; self.i = 0
    def __next__(self):
        if self.i >= len(self.data): raise StopIteration
        v = self.data[self.i]; self.i += 1; return v

class MyCollection:
    def __init__(self, data): self._data = data
    def __iter__(self): return MyIterator(self._data)

for x in MyCollection([1,2,3]): print(x)
```

### 17. Mediator

Purpose: Centralize communication between related objects.

Example:

```python
class Tower:
    def request_takeoff(self, plane): print(f"Clearance for {plane}")

class Plane:
    def __init__(self, tower, name): self.tower = tower; self.name = name
    def request(self): self.tower.request_takeoff(self.name)

t = Tower(); p = Plane(t, 'A1'); p.request()
```

### 18. Memento

Purpose: Capture an object's internal state without breaking encapsulation.

Example:

```python
class Memento:
    def __init__(self, state): self._state = state
    def state(self): return self._state

class Document:
    def __init__(self, text=''): self._text = text
    def write(self, t): self._text += t
    def create_memento(self): return Memento(self._text)
    def restore(self, m): self._text = m.state()

doc = Document('A')
snap = doc.create_memento()
doc.write('B')
doc.restore(snap)
```

### 19. Observer

Purpose: Define a one-to-many dependency so observers are notified of state changes.

Example:

```python
from abc import ABC, abstractmethod

# Subject Interface
class Subject(ABC):
    @abstractmethod
    def register_observer(self, observer):
        pass

    @abstractmethod
    def remove_observer(self, observer):
        pass

    @abstractmethod
    def notify_observers(self):
        pass

# Concrete Subject
class WeatherStation(Subject):
    def __init__(self):
        self._observers = []
        self._temperature = 0

    def register_observer(self, observer):
        self._observers.append(observer)

    def remove_observer(self, observer):
        self._observers.remove(observer)

    def notify_observers(self):
        for observer in self._observers:
            observer.update(self._temperature)

    def set_temperature(self, temp):
        print(f"WeatherStation: New temperature is {temp}")
        self._temperature = temp
        self.notify_observers()

# Observer Interface
class Observer(ABC):
    @abstractmethod
    def update(self, temperature):
        pass

# Concrete Observers
class PhoneDisplay(Observer):
    def update(self, temperature):
        print(f"PhoneDisplay: Temperature is now {temperature} degrees.")

class TVDisplay(Observer):
    def update(self, temperature):
        print(f"TVDisplay: Current temperature is {temperature} degrees.")

# Usage
weather_station = WeatherStation()
phone_display = PhoneDisplay()
tv_display = TVDisplay()

weather_station.register_observer(phone_display)
weather_station.register_observer(tv_display)

weather_station.set_temperature(25)
print("\n")
weather_station.set_temperature(30)
```

### 20. State

Purpose: Allow an object to change behavior when its internal state changes.

Example:

```python
from abc import ABC, abstractmethod

# State Interface
class VendingMachineState(ABC):
    @abstractmethod
    def handle_request(self):
        pass

# Concrete States
class ReadyState(VendingMachineState):
    def handle_request(self):
        print("Ready state: Please select a product.")

class ProductSelectedState(VendingMachineState):
    def handle_request(self):
        print("Product selected state: Processing payment.")

class PaymentPendingState(VendingMachineState):
    def handle_request(self):
        print("Payment pending state: Dispensing product.")

# Context
class VendingMachineContext:
    def __init__(self):
        self._state = ReadyState()

    def set_state(self, state):
        self._state = state
        print(f"Vending machine state changed to: {self._state.__class__.__name__}")

    def request(self):
        self._state.handle_request()

# Usage
vending_machine = VendingMachineContext()

vending_machine.request()
vending_machine.set_state(ProductSelectedState())
vending_machine.request()
vending_machine.set_state(PaymentPendingState())
vending_machine.request()
```

### 21. Strategy

Purpose: Encapsulate interchangeable algorithms and make them selectable at runtime.

Example:

```python
from abc import ABC, abstractmethod

# Strategy Interface
class SortingStrategy(ABC):
    @abstractmethod
    def sort(self, data):
        pass

# Concrete Strategies
class BubbleSortStrategy(SortingStrategy):
    def sort(self, data):
        print("Sorting with Bubble Sort")
        n = len(data)
        for i in range(n):
            for j in range(0, n - i - 1):
                if data[j] > data[j + 1]:
                    data[j], data[j + 1] = data[j + 1], data[j]
        return data

class QuickSortStrategy(SortingStrategy):
    def sort(self, data):
        print("Sorting with Quick Sort")
        # Simplified quick sort logic for demonstration
        if len(data) <= 1:
            return data
        pivot = data[len(data) // 2]
        left = [x for x in data if x < pivot]
        middle = [x for x in data if x == pivot]
        right = [x for x in data if x > pivot]
        return self.sort(left) + middle + self.sort(right)

# Context
class SortingContext:
    def __init__(self, strategy: SortingStrategy):
        self._strategy = strategy

    def set_strategy(self, strategy):
        self._strategy = strategy

    def perform_sort(self, data):
        return self._strategy.sort(data)

# Usage
data = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5]

context = SortingContext(BubbleSortStrategy())
sorted_data = context.perform_sort(data)
print(f"Result: {sorted_data}\n")

context.set_strategy(QuickSortStrategy())
sorted_data = context.perform_sort(data)
print(f"Result: {sorted_data}")
```

### 22. Template Method

Purpose: Define the skeleton of an algorithm in a base class, letting subclasses override steps.

Example:

```python
from abc import ABC, abstractmethod

class BeverageMaker(ABC):
    def make_beverage(self):
        self.boil_water()
        self.brew()
        self.pour_in_cup()
        self.add_condiments()

    def boil_water(self):
        print("Boiling water.")

    def pour_in_cup(self):
        print("Pouring into cup.")

    @abstractmethod
    def brew(self):
        pass

    @abstractmethod
    def add_condiments(self):
        pass

class CoffeeMaker(BeverageMaker):
    def brew(self):
        print("Brewing coffee grounds.")

    def add_condiments(self):
        print("Adding sugar and milk.")

class TeaMaker(BeverageMaker):
    def brew(self):
        print("Steeping the tea bag.")

    def add_condiments(self):
        print("Adding lemon.")

# Usage
print("Making coffee...")
coffee_maker = CoffeeMaker()
coffee_maker.make_beverage()

print("\nMaking tea...")
tea_maker = TeaMaker()
tea_maker.make_beverage()
```

### 23. Visitor

Purpose: Add new operations to class hierarchies without modifying the element classes.

Example:

```python
from abc import ABC, abstractmethod

# Visitor Interface
class ShapeVisitor(ABC):
    @abstractmethod
    def visit_circle(self, circle):
        pass

    @abstractmethod
    def visit_square(self, square):
        pass

# Element Interface
class Shape(ABC):
    @abstractmethod
    def accept(self, visitor):
        pass

# Concrete Elements
class Circle(Shape):
    def __init__(self, radius):
        self.radius = radius

    def accept(self, visitor):
        visitor.visit_circle(self)

class Square(Shape):
    def __init__(self, side):
        self.side = side

    def accept(self, visitor):
        visitor.visit_square(self)

# Concrete Visitor
class AreaCalculator(ShapeVisitor):
    def visit_circle(self, circle):
        area = 3.14 * circle.radius ** 2
        print(f"Calculated area of Circle: {area}")

    def visit_square(self, square):
        area = square.side ** 2
        print(f"Calculated area of Square: {area}")

# Client Code
if __name__ == "__main__":
    shapes = [Circle(3), Square(4)]
    area_calculator = AreaCalculator()

    for shape in shapes:
        shape.accept(area_calculator)
```


