---
title: "Databricks Spark Development"
date: 2025-09-25
tags:
    - data-engineering
    - notes

---
A revision of spark and details about how it is used in the databricks environment

Introduction to Spark
Exploring Spark Architecture
Spark components: RDD API (spark core) -> DataFrame API (structured data ops) -> sparksql,mllib etc
Spark runtime architecture:
Driver - plans, coordinates and executes program. client/job interacts with it.
creates sparksession (entrypoint for all spark apps)
creates a DAG from the spark app
DAG
spark jobs are broken into stages. stages - groups of jobs that are executed in parallel, when they all finish, they send the data to another stage through a process of shuffling
Directed - computations flow ahead
Acyclic - the job terminates and stages do not loop
Graph - dependency graph of election
assigns, schedules, monitors, handles failures of tasks and returns result to client
master - cluster manager - allocates cluster resources to the driver internally
workers - nodes in the cluster; they host (one or many) executors, depending on available cores (spark.executor.cores) and memory (spark.executor.memory);
executors - execute tasks assigned by the driver - run on worker nodes. they store intermediate and final results in memory or on disk
Spark UI
App UI - per SparkSession - DAG visualisation etc
Master UI - per cluster - worker node health, cluster-wide resource allocation
Spark cluster types
all-purpose cluster - support notebooks, jobs, dashboards, support auto-termination
job clusters - ephemeral, terminates on completion
sql warehouse - query perf optimised, instant startup, autoscaling
executors store cached partitions - good idea to unpersist it after use
Spark Dataframes and sql
DF - distributed collection of records with predefined schemas; DF supports schema enforcement; Dataframes are evaluated as DAGs using lazy evaluation (doesn't run until show(), collect(), write() type operations) and provide lineage(record of how the DF was created) and fault tolerance
DF API operations -
Optimisations - adaptive query exec, in-mem columnar storage, built in stats collection, catalyst optimiser (rule/cost based optimiser), Photon (query engine)
Common DF API methods - select, filter, withColumn, groupBy, agg, count, show, take(n)
DF registration - temporary views createOrReplaceTempView(), createGlobalTempView() - enables sql queries on dfs - full sql support
DF schemas - every DF has a defined schema. It can be specified (more efficient) or it can be inferred. printSchema() - prints out the dataframe schema. DDL schemas can be used along with StructTypes
Transformations and Actions - DFs are immutable. transformations create new DFs. Actions trigger computation (write() show() etc)
SQL Metastores - a meta store defines table schemas and locations, defines table partitions, stores info like tables, views, functions. unity catalog - centralised metadata service
DS Programming fundamentals
Shared-Nothing architecture
nodes do not share memory cpu disk etc
adding more nodes improves node performance
fault tolerant - isolated failures
resource partitioning
Partitioning
data distribution - data is in mut-ex in-mem partitions
processing model - parallel - one partition = one task in spark
shuffle - redistribute data for groupBy. most expensive operation in spark. data is repartitioned on the basis of key
MapReduce
Algorithm
Map - data is prepared (e.g filtered- narrow transformation - on the same node)
Shuffle - restructure to meet aggregation/join requirements
Reduce - aggregate and return result
Sparks implementation
every spark operation is either map/shuffle/reduce (!)
groupBY :map(extract keys) -> shuffle (by key) -> reduce (aggregate)
join: map(prepare keys) -> shuffle (co-locate: rows with same key on same partition) -> reduce (combine)
filter: map(evaluate condition) -> no shuffle or reduce needed
ETL Operations with DF API
DF transformation methods - parallel, map to sql, new DF created (since immutable), plan executed after action is called - select, filter, wherey, groupby, orderby, sort, join
Handling missing values - isNull(), isNotNull(), count(col), df.fillna(), df.dropna()
Referencing DF columns - direct - df.select("name"), by attribute - df.first-name, column expression - df.select(df["name"]), column object - df.select(col("name").alias("customer_name"))
Common column object methods - alias(), cast(), contains() - string matching, asc() used with sort/orderBY
built in functions
functions operate on columns in DFs
can operate on a scalar(strings, int) or complex data types
function categories include - math, datetimne, collection, bitwise, aggregate, window etc
e.g regexp_replace(col, pattern, replace), coalesce() - find first non-null values
User Defined FUnctions (UDFs) - use python functions on DF columns - may impact performance (not optimised by catalyst optimiser + serialisation overhead between python and JVM) - avoid if possible
Pandas UDFs and Apache Arrow
operate on batches of rows instead of single row using apache arrow for efficient python-JVM serialisation
usage: add decorator @pandas_udf("integer")
built in funcs > pandas udfs > non-pandas counterpart
practical for handling complex aggregations or custom transformations
demo -
flight dataset -"filter early, filter often" - count nulls using spark sql -
df.explain() - data cleaning - drop nulls; if it doesnt cast as an integer, removed
data enrichment - create datetime instead of a seperate column for each; calculate time deltas between two columns and drop source; bin delay into moderate, severe delay and drop source
convert the above into a single big statements that results in a dataframe (saved in unity catalog)
spark sql and dataframe api approach results are equivalent - the sql plan and dataframe plan are equivalent
Pandas API on Spark
datasets do not need to fit in memory
performance comparison - 31 GB - pyspark.pandas is faster, 95GB - OOM error for non-spark pandas
In pandas, each row is indexed, spark is distributed, so it has a different style of index. Index types are 'sequence' - (good for "medium" sized data), 'distributed sequence', and 'distributed'
Developing Applications with Spark
Groupby - groupBY :map(extract keys) -> shuffle (by key) -> reduce (aggregate)
aggregations execute in parallel
returns a GroupedData object that lets you chain multiple aggregation methods count(),sum(), min()
can be used with pandasUDFs
Window functions - calculating running totals, ranking records within groups(rank()), accessing previous/next row values (lag()), comparing row values to group aggregates\
DF joins and sets
Joins - inner,outer,left,right,cross. avoid naming conflicts by using aliases
DF set operations - on DFs of matching schemas - union,intersect,subtract,unionByName() - duplicates are removed unless xxxAll() is used e.g unionAll()
Join performance considerations -
strategy selections - spark optimises automatically; similar DataFrames should be referenced first
when joining small tables, broadcast() optimises performance as it avoids shuffles by sending the DataFrame to all tables
data skew handling - uneven distribution of keys can impact perf; repartition
memory management - monitor "shuffle spill" metrics for joins, cache frequently joined DFs, use project to select needed columns before joining
Working with complex data
Complex Types - arrays (ArrayType), Structs(StructType - nested structures with predefined named fields), Maps (MapType - key value pair where keys are not pre-defined)
 json strings require parsing overhead so convert to Structs (which give type safety and better performance) using from_json
 use explode() to unnest data, but not on large arrays
Common array operations - array_contains, size, element_at (1 based indexing), array_distinct. Aggregating - collect_list/ collect_set (may be memory-intensive for large groups)
Stream Processing
Introduction
stream - unbounded data set, often event-driven
Dstream - Discretised streaming - processing data in small time based RDD batches
structured streaming - DF and Dataset API based - supoprts event time processing, better to handle late and out of order data
microbatching - data is collected in time based chunks, each chunk is processed as a mini batch job (batch intervals are 100ms to a few seconds)
e.g fraud detection, iot monitoring,, live dashboards
Structured streaming
declarative api for distributed stream processing
streaming data is treated as an infinite table
new record is a new row
queries are continuously updated as new data arrives
dame DataFrame API as batch processing
query plans are automatically optimised
Key features
event time processing
watermark support for late data - defines how long the system should wait for late data before finalizing a result. Spark will include late data within the watermark threshold (e.g 10 min) but discard data that arrives after the threshold.
end to end exactly once guarantees- Ensures no data is lost or processed twice, even during failures - by implementing idempotent writes + Checkpoints that store metadata about the streaming query, ensuring that no data is processed twice after a failure.
Streaming sources and sinks
built in sources - files, kafka, socket, rate(testing source) - read by DataStreamReader
built in sinks - files, kafka, foreach(runs custom logic for each record), console/memory - DataStreamWriter
autoloader - cloud_files - tracks new files in cloud and supports schema changes -
streaming transformations - create a streaming dataframe + apply same transformations as a normal dataframe - union etc
streaming query - "start" a streaming query - it runs indefinitely until stopped. streaming query is similar to an action- it will trigger jobs
Triggers - control when streamed data is processed - latency vs throughput tradeoffs
default trigger - asap
fixed interval trigger - at specified time intervals - to limit resource usage
available now trigger - processes data that is "available now" and stops and does not wait for more data to arrive
]Output modes - choice depends on what query is being executed whether it has aggregations and state or not
append - default - only adds new records to the sink - best for simple stateless queries without aggregations
update - for dashboards and real time metrics - modifies existing records and adds new ones - only outputs records that changed since the last trigger
complete - ideal for running totals and leaderboards - writes entire result table to sink each time
Monitoring streaming queries - monitor processing rate, latency, memory usage, garbage collection
spark ui - stream tab shows active queries, progress details per batch
Use external monitoring tools - prometheus grafana etc
Advanced stream processing and analysis
stateful vs stateless operations
stateless - each record independent, no memory of other records
stateful - maintain information across batches - require checkpoint location (to maintain state across batches, recover state in case of failures, handle replay of data without duplicating results) e.g groupBy, join, dropDuplicates
Maintaining state in distributed streaming applications
challenges - data is distributed across worker nodes, need fault tolerance for state recover, memory limitations for large state, consistency across node failures
RocksDB - state backend - built-in state store for structured streaming. efficient storage and retrieval, automatic compaction, supports large state size
Streaming Joins - streaming DF can be joined with a static DF or another streaming DF or the results of a "Complete" output mode streaming operation
full and cross join not supported - inner, left outer, right outer, left semi and left anti supported
streaming aggregations - count, sum/avg, min/max. approximate functions that are more performant available - e.g approx_count_distinct(). to aggregate streaming data windows provide the boundary
Window Operations
tumbling windows
sliding window
session window - dynamically size, based on user activity
Handle late arriving data - watermarks define how long spark waits for out of order events before finalising a window
Monitor and Optimise spark workloads on databricks


---
Tangents
Indexes
Pandas: Labels rows for easy access and alignment; not for performance indexing.
SQL DB: Speeds up queries using structures like B-trees on columns.\
Search Engine: Indexes text or vectors for fast lookup or similarity search.
Self-describing data formats contain data+metadata (like parquet, json), unlike csv which has only data
consistency in ACID (schema constrained) is different than consistency in CAP (order of read/write specific)
Contention- Types and Example
CPU contention - Too many threads competing for CPU time
Lock contention - Multiple threads trying to acquire the same lock
I/O contention - Processes competing for disk or network access
Memory contention - Tasks fighting over limited RAM or cache lines

---
