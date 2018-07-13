xquery version "3.0";

import module namespace xdb="http://exist-db.org/xquery/xmldb";
import module namespace xrest="http://exquery.org/ns/restxq/exist" at "java:org.exist.extensions.exquery.restxq.impl.xquery.exist.ExistRestXqModule";

(: The following external variables are set by the repo:deploy function :)

(: file path pointing to the exist installation directory :)
declare variable $home external;
(: path to the directory containing the unpacked .xar package :)
declare variable $dir external;
(: the target collection into which the app is deployed :)
declare variable $target external;

let $app-root := 
    let $rawPath := system:get-module-load-path()
    let $modulePath :=
        (: strip the xmldb: part :)
        if (starts-with($rawPath, "xmldb:exist://")) then
            if (starts-with($rawPath, "xmldb:exist://embedded-eXist-server")) then
                substring($rawPath, 36)
            else
                substring($rawPath, 15)
        else
            $rawPath
    return
        substring-after(substring-before($modulePath, "/modules"),'/apps/')

return 
(: Add additional index configuration file for depreciated records, they should not be indexed :)
(xdb:create-collection(concat('/db/system/config/db/apps/',$app-root),'data'),
xdb:create-collection(concat('/db/system/config/db/apps/',$app-root, '/data'),'deprecated'),
xdb:store-files-from-pattern(concat('/db/system/config/db/apps/',$app-root, '/data/deprecated'), concat('/db/apps/',$app-root,'/data/deprecated'), "*.xconf"))