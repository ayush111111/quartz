---
title: "Databricks Spark Developer"
date: 2025-09-25
tags:
    - data-engineering
    - notes

---
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
                        3.  Acyclic - the job terminates and stages dont loop
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
            1.  nodes do not share mmemory cpu disk etc
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
                1.  every spark operation is either map/shuffle/reduce (!)
                    1.  groupBY :map(extract keys) -> shuffle (by key) -> reduce (aggregate)
                    2.  join: map(prepare keys) -> shuffle (co-locate: rows with same key on same partition) -> reduce (combine)
                    3.  filter: map(evaluate condition) -> no shuffle or reduce needed
    4.  ETL Operations with DF API
        1.  DF transformation methods - parallel, map to sql, new DF created (since immutable), plan executed after action is called - select, filter, wherey, groupby, orderby, sort, jion
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






\---
Tangents

1.  Indexes
    1.  **Pandas:** Labels rows for easy access and alignment; not for performance indexing.
    2.  **SQL DB:** Speeds up queries using structures like B-trees on columns.\\
    3.  **Search Engine:** Indexes text or vectors for fast lookup or similarity search.
2.  Self-describing data formats contain data+metadata (like parquet, json), unlike csv which has only data
3.  consistency in ACID is different than consistency in CAP
4.  Contention

Type Example

**CPU contention**

Too many threads competing for CPU time

**Lock contention**

Multiple threads trying to acquire the same lock

**I/O contention**

Processes competing for disk or network access

**Memory contention**

Tasks fighting over limited RAM or cache lines

1.


\---
