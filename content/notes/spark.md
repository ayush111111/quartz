---
title: "Databricks Spark Development"
date: 2025-09-25
tags:
    - data-engineering
    - notes

---
A revision of spark and details about how it is used in the databricks environment
# Apache Spark

1.  Introduction to Spark
    1.  Exploring Spark Architecture
        1.  Spark components: RDD API (spark core) -> DataFrame API (structured data ops) -> sparksql,mllib etc
        2.  Spark runtime architecture:
            1.  Driver - plans, coordinates and executes program. client/job interacts with it.
                1.  creates sparksession (entrypoint for all spark apps)
                2.  creates a DAG from the spark app
                    1.  DAG
                        1.  spark jobs are broken into stages. stages - groups of jobs that are executed in parallel, when they all finish, they send the data to another stage through a process of shuffling
                        2.  Directed - computations flow ahead
                        3.  Acyclic - the job terminates and stages do not loop
                        4.  Graph - dependency graph of election
                3.  assigns, schedules, monitors, handles failures of tasks and returns result to client
            2.  master - cluster manager - allocates cluster resources to the driver internally
            3.  workers - nodes in the cluster; they host (one or many) executors, depending on available cores (spark.executor.cores) and memory (spark.executor.memory);
            4.  executors - execute tasks assigned by the driver - run on worker nodes. they store intermediate and final results in memory or on disk
        3.  Spark UI
            1.  App UI - per SparkSession - DAG visualisation etc
            2.  Master UI - per cluster - worker node health, cluster-wide resource allocation
        4.  Spark cluster types
            1.  all-purpose cluster - support notebooks, jobs, dashboards, support auto-termination
            2.  job clusters - ephemeral, terminates on completion
            3.  sql warehouse - query perf optimised, instant startup, autoscaling
        5.  executors store cached partitions - good idea to unpersist it after use
    2.  Spark Dataframes and sql
        1.  DF - distributed collection of records with predefined schemas; DF supports schema enforcement; Dataframes are evaluated as DAGs using lazy evaluation (doesn't run until show(), collect(), write() type operations) and provide lineage(record of how the DF was created) and fault tolerance
        2.  DF API operations -
            1.  Optimisations - adaptive query exec, in-mem columnar storage, built in stats collection, catalyst optimiser (rule/cost based optimiser), Photon (query engine)
            2.  Common DF API methods - select, filter, withColumn, groupBy, agg, count, show, take(n)
        3.  DF registration - temporary views createOrReplaceTempView(), createGlobalTempView() - enables sql queries on dfs - full sql support
        4.  DF schemas - every DF has a defined schema. It can be specified (more efficient) or it can be inferred. printSchema() - prints out the dataframe schema. DDL schemas can be used along with StructTypes
        5.  Transformations and Actions - DFs are immutable. transformations create new DFs. Actions trigger computation (write() show() etc)
        6.  SQL Metastores - a meta store defines table schemas and locations, defines table partitions, stores info like tables, views, functions. unity catalog - centralised metadata service
    3.  DS Programming fundamentals
        1.  Shared-Nothing architecture
            1.  nodes do not share memory cpu disk etc
            2.  adding more nodes improves node performance
            3.  fault tolerant - isolated failures
            4.  resource partitioning
        2.  Partitioning
            1.  data distribution - data is in mut-ex in-mem partitions
            2.  processing model - parallel - one partition = one task in spark
        3.  shuffle - redistribute data for groupBy. most expensive operation in spark. data is repartitioned on the basis of key
        4.  MapReduce
            1.  Algorithm
                1.  Map - data is prepared (e.g filtered- narrow transformation - on the same node)
                2.  Shuffle - restructure to meet aggregation/join requirements
                3.  Reduce - aggregate and return result
            2.  Sparks implementation
                1.  **every spark operation is either map/shuffle/reduce** (!)
                    1.  groupBY :map(extract keys) -> shuffle (by key) -> reduce (aggregate)
                    2.  join: map(prepare keys) -> shuffle (co-locate: rows with same key on same partition) -> reduce (combine)
                    3.  filter: map(evaluate condition) -> no shuffle or reduce needed
    4.  ETL Operations with DF API
        1.  DF transformation methods - parallel, map to sql, new DF created (since immutable), plan executed after action is called - select, filter, wherey, groupby, orderby, sort, join
        2.  Handling missing values - isNull(), isNotNull(), count(col), df.fillna(), df.dropna()
        3.  Referencing DF columns - direct - df.select("name"), by attribute - df.first-name, column expression - df.select(df\["name"\]), column object - df.select(col("name").alias("customer\_name"))
        4.  Common column object methods - alias(), cast(), contains() - string matching, asc() used with sort/orderBY
        5.  built in functions
            1.  functions operate on columns in DFs
            2.  can operate on a scalar(strings, int) or complex data types
            3.  function categories include - math, datetimne, collection, bitwise, aggregate, window etc
            4.  e.g regexp\_replace(col, pattern, replace), coalesce() - find first non-null values
        6.  User Defined FUnctions (UDFs) - use python functions on DF columns - may impact performance (not optimised by catalyst optimiser + serialisation overhead between python and JVM) - avoid if possible
        7.  Pandas UDFs and Apache Arrow
            1.  operate on batches of rows instead of single row using apache arrow for efficient python-JVM serialisation
            2.  usage: add decorator @pandas\_udf("integer")
            3.  built in funcs > pandas udfs > non-pandas counterpart
            4.  practical for handling complex aggregations or custom transformations
        8.  demo -
            1.  flight dataset -"filter early, filter often" - count nulls using spark sql -
            2.  df.explain() - data cleaning - drop nulls; if it doesnt cast as an integer, removed
            3.  data enrichment - create datetime instead of a seperate column for each; calculate time deltas between two columns and drop source; bin delay into moderate, severe delay and drop source
            4.  convert the above into a single big statements that results in a dataframe (saved in unity catalog)
        9.  spark sql and dataframe api approach results are equivalent - the sql plan and dataframe plan are equivalent
    5.  Pandas API on Spark
        1.  datasets do not need to fit in memory
        2.  performance comparison - 31 GB - pyspark.pandas is faster, 95GB - OOM error for non-spark pandas
        3.  In pandas, each row is indexed, spark is distributed, so it has a different style of index. Index types are 'sequence' - (good for "medium" sized data), 'distributed sequence', and 'distributed'
2.  Developing Applications with Spark
    1.  Groupby - groupBY :map(extract keys) -> shuffle (by key) -> reduce (aggregate)
        1.  aggregations execute in parallel
        2.  returns a GroupedData object that lets you chain multiple aggregation methods count(),sum(), min()
        3.  can be used with pandasUDFs
    2.  Window functions - calculating running totals, ranking records within groups(rank()), accessing previous/next row values (lag()), comparing row values to group aggregates\\
    3.  DF joins and sets
        1.  Joins - inner,outer,left,right,cross. avoid naming conflicts by using aliases
        2.  DF set operations - on DFs of matching schemas - union,intersect,subtract,unionByName() - duplicates are removed unless xxxAll() is used e.g unionAll()
        3.  Join performance considerations -
            1.  strategy selections - spark optimises automatically; similar DataFrames should be referenced first
            2.  when joining small tables, **broadcast() optimises performance as it avoids shuffles** by sending the DataFrame to all tables
            3.  data skew handling - uneven distribution of keys can impact perf; repartition
            4.  memory management - monitor "shuffle spill" metrics for joins, cache frequently joined DFs, use project to select needed columns before joining
    4.  Working with complex data
        1.  Complex Types - arrays (ArrayType), Structs(StructType - nested structures with predefined named fields), Maps (MapType - key value pair where keys are not pre-defined)
        2.  json strings require parsing overhead so convert to Structs (which give type safety and better performance) using from\_json
        3.  use explode() to unnest data, but not on large arrays
        4.  Common array operations - array\_contains, size, element\_at (1 based indexing), array\_distinct. Aggregating - collect\_list/ collect\_set (may be memory-intensive for large groups)
3.  Stream Processing
    1.  Introduction
        1.  stream - unbounded data set, often event-driven
        2.  Dstream - Discretised streaming - processing data in small time based RDD batches
        3.  structured streaming - DF and Dataset API based - supoprts event time processing, better to handle late and out of order data
        4.  microbatching - data is collected in time based chunks, each chunk is processed as a mini batch job (batch intervals are 100ms to a few seconds)
        5.  e.g fraud detection, iot monitoring,, live dashboards
    2.  Structured streaming
        1.  declarative api for distributed stream processing
        2.  streaming data is treated as an infinite table
            1.  new record is a new row
            2.  queries are continuously updated as new data arrives
            3.  dame DataFrame API as batch processing
            4.  query plans are automatically optimised
        3.  Key features
            1.  event time processing
            2.  watermark support for late data - defines how long the system should wait for late data before finalizing a result. Spark will include late data within the watermark threshold (e.g 10 min) but discard data that arrives after the threshold.
            3.  end to end exactly once guarantees- Ensures no data is lost or processed twice, even during failures - by implementing idempotent writes + Checkpoints that store metadata about the streaming query, ensuring that no data is processed twice after a failure.
        4.  Streaming sources and sinks
            1.  built in sources - files, kafka, socket, rate(testing source) - read by DataStreamReader
            2.  built in sinks - files, kafka, foreach(runs custom logic for each record), console/memory - DataStreamWriter
            3.  autoloader - cloud\_files - tracks new files in cloud and supports schema changes -
        5.  streaming transformations - create a streaming dataframe + apply same transformations as a normal dataframe - union etc
        6.  streaming query - "start" a streaming query - it runs indefinitely until stopped. streaming query is similar to an action- it will trigger jobs
        7.  Triggers - control when streamed data is processed - latency vs throughput tradeoffs
            1.  default trigger - asap
            2.  fixed interval trigger - at specified time intervals - to limit resource usage
            3.  available now trigger - processes data that is "available now" and stops and does not wait for more data to arrive
        8.  \]Output modes - choice depends on what query is being executed whether it has aggregations and state or not
            1.  append - default - only adds new records to the sink - best for simple stateless queries without aggregations
            2.  update - for dashboards and real time metrics - modifies existing records and adds new ones - only outputs records that changed since the last trigger
            3.  complete - ideal for running totals and leaderboards - writes entire result table to sink each time
        9.  Monitoring streaming queries - monitor processing rate, latency, memory usage, garbage collection
            1.  spark ui - stream tab shows active queries, progress details per batch
            2.  Use external monitoring tools - prometheus grafana etc
    3.  Advanced stream processing and analysis
        1.  stateful vs stateless operations
            1.  stateless - each record independent, no memory of other records
            2.  stateful - maintain information across batches - require checkpoint location (to maintain state across batches, recover state in case of failures, handle replay of data without duplicating results) e.g groupBy, join, dropDuplicates
        2.  Maintaining state in distributed streaming applications
            1.  challenges - data is distributed across worker nodes, need fault tolerance for state recover, memory limitations for large state, consistency across node failures
            2.  RocksDB - state backend - built-in state store for structured streaming. efficient storage and retrieval, automatic compaction, supports large state size
            3.  Streaming Joins - streaming DF can be joined with a static DF or another streaming DF or the results of a "Complete" output mode streaming operation
                1.  full and cross join not supported - inner, left outer, right outer, left semi and left anti supported
            4.  streaming aggregations - count, sum/avg, min/max. approximate functions that are more performant available - e.g approx\_count\_distinct(). to aggregate streaming data windows provide the boundary
            5.  Window Operations
                1.  tumbling windows
                2.  sliding window
                3.  session window - dynamically size, based on user activity
            6.  Handle late arriving data - watermarks define how long spark waits for out of order events before finalising a window
4.  Monitor and Optimise spark workloads on databricks
    1.



\---
Tangents

1.  Indexes
    1.  **Pandas:** Labels rows for easy access and alignment; not for performance indexing.
    2.  **SQL DB:** Speeds up queries using structures like B-trees on columns.\\
    3.  **Search Engine:** Indexes text or vectors for fast lookup or similarity search.
2.  Self-describing data formats contain data+metadata (like parquet, json), unlike csv which has only data
3.  consistency in ACID (schema constrained) is different than consistency in CAP (order of read/write specific)
4.  Contention- Types and Example
    1.  **CPU contention -** Too many threads competing for CPU time
    2.  **Lock contention -** Multiple threads trying to acquire the same lock
    3.  **I/O contention -** Processes competing for disk or network access
    4.  **Memory contention -** Tasks fighting over limited RAM or cache lines
5.


\---
